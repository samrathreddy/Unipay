const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Payment = require('../models/paymentModel');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
});

const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID; // Admin channel ID
const VERIFIED_CHANNEL_ID = process.env.VERIFIED_CHANNEL_ID; // Verified channel ID
const REJECTED_CHANNEL_ID = process.env.REJECTED_CHANNEL_ID; // Rejected channel ID

const DATA_FILE_PATH = './paymentDetails.json'; // Path to your JSON file

// Load payment details from a JSON file
function loadPaymentDetails() {
    if (fs.existsSync(DATA_FILE_PATH)) {
        const data = fs.readFileSync(DATA_FILE_PATH);
        return JSON.parse(data);
    }
    return {};
}

// Save payment details to a JSON file
function savePaymentDetails(paymentDetails) {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(paymentDetails, null, 2));
}

// Load payment details on startup
const paymentDetailsMap = loadPaymentDetails();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Function to create an embed for payment details
function createPaymentEmbed(paymentDetails, status) {
    const embed = new EmbedBuilder()
        .setColor(status === 'verified' ? '#00ff00' : status === 'pending'? '#0099ff' : '#ff0000') // Green for verified, red for wrong
        .setTitle(`Payment ${status === 'verified' ? 'Sucess' : status === 'pending'? 'In Progress' : 'Rejection'}`)
        .setDescription(`Details for the payment:`);

    // Add fields if they have values
    if (paymentDetails.transactionId) {
        embed.addFields({ name: 'Transaction ID', value: paymentDetails.transactionId, inline: false });
    }
    if (paymentDetails.roll) {
        embed.addFields({ name: 'Roll Number', value: paymentDetails.roll, inline: false });
    }
    if (paymentDetails.name) {
        embed.addFields({ name: 'Name', value: paymentDetails.name, inline: false });
    }
    if (paymentDetails.Branch) {
        embed.addFields({ name: 'Branch', value: paymentDetails.Branch, inline: false });
    }
    if (paymentDetails.feeType) {
        embed.addFields({ name: 'Fee Type', value: paymentDetails.feeType, inline: false });
    }
    if (paymentDetails.feeYear) {
        embed.addFields({ name: 'Year', value: paymentDetails.feeYear, inline: false });
    }
    if (paymentDetails.feeSem) {
        embed.addFields({ name: 'Semester', value: paymentDetails.feeSem, inline: false });
    }
    if (paymentDetails.amount) {
        embed.addFields({ name: 'Amount', value: `${paymentDetails.amount} INR`, inline: false });
    }
    if (paymentDetails.date) {
        embed.addFields({ name: 'Date', value: paymentDetails.date, inline: true });
    }
    if (paymentDetails.time) {
        embed.addFields({ name: 'Time', value: paymentDetails.time, inline: true });
    }

    embed.setFooter({ text: 'Payment status updated.' });
    return embed;
}

// Function to send payment details for verification
function sendPaymentForVerification(paymentDetails) {
    const adminChannel = client.channels.cache.get(ADMIN_CHANNEL_ID);

    const embed = createPaymentEmbed(paymentDetails, 'pending');

    adminChannel.send({ embeds: [embed] })
        .then(async (verifyMessage) => {
            await verifyMessage.react('✅'); // Tick emoji
            await verifyMessage.react('❌'); // Cross emoji

            // Store payment details with the message ID
            paymentDetailsMap[verifyMessage.id] = paymentDetails;
            savePaymentDetails(paymentDetailsMap); // Save updated payment details
        })
        .catch(console.error);
}

// Handle reaction events
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore bot reactions

    try {
        const fetchedMessage = await reaction.message.fetch();

        const paymentDetails = paymentDetailsMap[fetchedMessage.id];
        if (!paymentDetails) return; // Exit if no payment details are associated with this message

        let embed;
        let paymentRecord = await Payment.findOne({ Roll: paymentDetails.roll });
        if (paymentRecord) {
            const transaction = paymentRecord.Payments.find(p => p.transactionId === paymentDetails.transactionId);
            
            if (reaction.emoji.name === '✅') {
                embed = createPaymentEmbed(paymentDetails, 'verified');
                const verifiedChannel = client.channels.cache.get(VERIFIED_CHANNEL_ID);
                await verifiedChannel.send({ embeds: [embed] });

                if (transaction) {
                    transaction.manual = 'Verified';
                }
                
                delete paymentDetailsMap[fetchedMessage.id];
                savePaymentDetails(paymentDetailsMap);

            } else if (reaction.emoji.name === '❌') {
                embed = createPaymentEmbed(paymentDetails, 'wrong');
                const rejectChannel = client.channels.cache.get(REJECTED_CHANNEL_ID);
                await rejectChannel.send({ embeds: [embed] });
                if (transaction) {
                    transaction.manual = 'Rejected';
                }
                delete paymentDetailsMap[fetchedMessage.id]; // Clean up the map
                savePaymentDetails(paymentDetailsMap); // Save updated payment details
            }
            // Save the updated paymentRecord back to the database
            await Payment.updateOne({ Roll: paymentDetails.roll }, { Payments: paymentRecord.Payments });
        } else {
            console.error("Payment record not found.");
        }
    } catch (error) {
        console.error('Error fetching message or processing reaction:', error);
    }
});

const userUsageMap = new Map(); // To track user command usage


client.on('messageCreate', async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'gettransaction') {
        try {
            // Rate limiting
            const userId = message.author.id;
            const currentTime = Date.now();
            const usageCount = userUsageMap.get(userId) || { count: 0, lastReset: currentTime };

            // Reset count if a day has passed
            if (currentTime - usageCount.lastReset >= 24 * 60 * 60 * 1000) {
                usageCount.count = 0;
                usageCount.lastReset = currentTime;
            }

            // Check if the user has reached the limit
            if (usageCount.count >= 10) {
                return message.author.send('You have reached your daily limit of 10 transactions. Please try again tomorrow.');
            }

            // Validate input
            if (args.length !== 2) {
                return message.author.send('Usage: !getTransaction <Roll> <DOB(DD/MM/YYYY)>');
            }

            const roll = args[0];
            const dob = args[1];
            const dobPattern = /^\d{2}\-\d{2}\-\d{4}$/;

            // Validate the DOB format
            if (!dobPattern.test(dob)) {
                return message.author.send('Invalid date format. Please use DD-MM-YYYY.');
            }

            // Fetch payment record
            let paymentRecord = await Payment.findOne({ Roll: roll, DOB: dob });
            if (paymentRecord) {
                const payments = paymentRecord.Payments;
                const lastPayments = payments.slice(-5);
        
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Payment Transactions for ${paymentRecord.Name}`)
                    .setDescription(`Last 5 Payments: \n`)
                    .setTimestamp();
        
                if (lastPayments.length > 0) {
                    lastPayments.forEach(payment => {
                        embed.addFields({
                            name: `Transaction ID: ${payment.transactionId}`,
                            value: `
                                **Roll:** ${paymentRecord.Roll}
                                **Amount:** ₹${payment.amount}
                                **Category:** ${payment.feeType}
                                **Year:** ${payment.feeYear}
                                **Status:** ${payment.manual}
                                **Created At:** ${payment.created_at_date} ${payment.created_at_time}
                                **Method:** ${payment.method}
                            `
                        });
                    });
                } else {
                    embed.setDescription(`No transactions found for ${paymentRecord.Name}.`);
                }

                // Update the usage count
                usageCount.count++;
                userUsageMap.set(userId, usageCount);
                console.log("Sent to discord")
                await message.author.send({ embeds: [embed] }); // Send the embed in DMs
            } else {
                await message.author.send(`No transactions found for Roll: ${roll} and DOB: ${dob}.`);
            }
        } catch (error) {
            console.error('Error sending to discord:', error);
            await message.author.send('Error sending to discord');
        }
    }
});




// Export the function to send payment details for verification
module.exports = {
    sendPaymentForVerification,
};

// Log in the bot
client.login(process.env.DISCORDTOKEN); // Ensure your bot token is in the environment variable
