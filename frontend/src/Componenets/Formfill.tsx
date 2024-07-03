import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, Box, Button, Card, CardContent, CircularProgress, Grid, Step, StepLabel, Stepper, Snackbar } from '@mui/material';
import { Field, Form, Formik, FormikConfig, FormikValues, ErrorMessage } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import * as Yup from 'yup';

interface MyFormValues {
  fullName: string;
  PhoneNumber: string;
  Email: string;
  agree: boolean;
  yearSem: string;
  amount: number;
  branch: string;
  description: string;
  Roll: string;
  DOB: string;
  Section: string;
  feeType: string;
  yearSemFee: string;
}

const sleep = (time: number) => new Promise((acc) => setTimeout(acc, time));

const validationSchema = Yup.object({
  fullName: Yup.string().required('Full Name is required'),
  PhoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Phone number is not valid').required('Phone Number is required'),
  Email: Yup.string().email('Invalid email address').required('Email is required'),
  agree: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  yearSem: Yup.string().required('Year-Semester is required'),
  branch: Yup.string().required('Branch is required'),
  description: Yup.string(),
});

interface FormikStepProps {
  children: React.ReactNode;
  label: string;
  validationSchema?: Yup.ObjectSchema;
}

export default function Formfill() {
  const [initialValues, setInitialValues] = useState<MyFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeeType, setSelectedFeeType] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/'); // Redirect to home if no token found
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/v1/api/fee/verify', {
          method: 'POST',
          headers: { authorization: `${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const feeType = data.feeType || '';
          const yearSemFee = feeType === 'CollegeFee' || feeType === 'TransportFee'
            ? `${data.feeYear}`
            : `${data.feeYear}-${data.CurrentSem}`;

          setInitialValues({
            fullName: data.Name || '',
            PhoneNumber: data.StudentMobileNo || '',
            Email: data.studentMailId || '',
            agree: false,
            yearSem: `${data.CurrentYear}-${data.CurrentSem}`,
            amount: data.fee || 0,
            branch: data.Branch || '',
            description: '',
            Roll: data.Roll || '',
            DOB: data.DOB || '',
            Section: data.Section || '',
            feeType,
            yearSemFee,
          });

          setSelectedFeeType(feeType);
          setLoading(false);
        } else {
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        navigate('/');
      }
    };

    verifyToken();
  }, [navigate]);

  const handleUpdate = async (values: MyFormValues) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      await fetch('http://localhost:8000/v1/api/fee/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `${token}`,
        },
        body: JSON.stringify({ PhoneNumber: values.PhoneNumber, Email: values.Email, description: values.description }),
      });
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleSuccessClose = () => {
    setSuccess(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Card>
      <CardContent>
        <FormikStepper
          initialValues={initialValues || {
            fullName: '',
            PhoneNumber: '',
            Email: '',
            agree: false,
            yearSem: '',
            amount: 0,
            branch: '',
            description: '',
            Roll: '',
            DOB: '',
            Section: '',
            feeType: '',
            yearSemFee: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            await sleep(3000);
            await handleUpdate(values);
            setSuccess(true);
          }}
        >
          <FormikStep label="Personal Data" validationSchema={validationSchema}>
            <Box paddingBottom={2}>
              <Field fullWidth name="fullName" component={TextField} label="Full Name" InputProps={{ readOnly: true }} />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="PhoneNumber" component={TextField} label="Phone Number" type="tel" required />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="Email" component={TextField} label="Email" type="email" required />
            </Box>
            <Box paddingBottom={2}>
              <Field
                name="yearSem"
                component={TextField}
                label="Current Year-Semester"
                select
                fullWidth
                InputProps={{ readOnly: true }}
              >
                <MenuItem value="I-I">I-I</MenuItem>
                <MenuItem value="I-II">I-II</MenuItem>
                <MenuItem value="II-I">II-I</MenuItem>
                <MenuItem value="II-II">II-II</MenuItem>
                <MenuItem value="III-I">III-I</MenuItem>
                <MenuItem value="III-II">III-II</MenuItem>
                <MenuItem value="IV-I">IV-I</MenuItem>
                <MenuItem value="IV-II">IV-II</MenuItem>
              </Field>
            </Box>
            <Box paddingBottom={2}>
              <Field
                name="branch"
                component={TextField}
                label="Branch"
                select
                fullWidth
                InputProps={{ readOnly: true }}
              >
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="ET">ET</MenuItem>
                <MenuItem value="EEE">EEE</MenuItem>
                <MenuItem value="ECE">ECE</MenuItem>
                <MenuItem value="MECH">MECH</MenuItem>
                <MenuItem value="CIVIL">CIVIL</MenuItem>
                <MenuItem value="EIE">EIE</MenuItem>
              </Field>
            </Box>
            <Box paddingBottom={2}>
              <Field
                name="agree"
                type="checkbox"
                component={CheckboxWithLabel}
                Label={{ label: 'I confirm that above details are true' }}
              />
              <div style={{ color: 'red' }}>
                <ErrorMessage name="agree" />
              </div>
            </Box>
          </FormikStep>
          <FormikStep label="Fee Details">
            <Box paddingBottom={2}>
              <Field fullWidth name="Roll" component={TextField} label="Roll Number" InputProps={{ readOnly: true }} />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="amount" component={TextField} label="Amount to be Paid" InputProps={{ readOnly: true }} />
            </Box>
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="feeType"
                component={TextField}
                label="Fee Category"
                InputProps={{ readOnly: true }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFeeType(e.target.value)}
              />
            </Box>
            <Box paddingBottom={2}>
              {selectedFeeType && (selectedFeeType === 'CollegeFee' || selectedFeeType === 'TransportFee') ? (
                <Field
                  name="yearSemFee"
                  component={TextField}
                  label="Fee Paying for Year"
                  select
                  fullWidth
                  InputProps={{ readOnly: true }}
                >
                  <MenuItem value="I">I</MenuItem>
                  <MenuItem value="II">II</MenuItem>
                  <MenuItem value="III">III</MenuItem>
                  <MenuItem value="IV">IV</MenuItem>
                </Field>
              ) : (
                <Field
                  name="yearSemFee"
                  component={TextField}
                  label="Fee Paying for Year-Semester"
                  select
                  fullWidth
                  InputProps={{ readOnly: true }}
                >
                  <MenuItem value="I-I">I-I</MenuItem>
                  <MenuItem value="I-II">I-II</MenuItem>
                  <MenuItem value="II-I">II-I</MenuItem>
                  <MenuItem value="II-II">II-II</MenuItem>
                  <MenuItem value="III-I">III-I</MenuItem>
                  <MenuItem value="III-II">III-II</MenuItem>
                  <MenuItem value="IV-I">IV-I</MenuItem>
                  <MenuItem value="IV-II">IV-II</MenuItem>
                </Field>
              )}
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="description" component={TextField} label="Description" multiline rows={4} />
            </Box>
          </FormikStep>
        </FormikStepper>
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleSuccessClose}
          message="Form submitted successfully!"
        />
      </CardContent>
    </Card>
  );
}

function FormikStep({ children, validationSchema }: FormikStepProps) {
  return <>{children}</>;
}

function FormikStepper({ children, ...props }: FormikConfig<FormikValues>) {
  const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step] as React.ReactElement<FormikStepProps>;
  const [completed, setCompleted] = useState(false);

  function isLastStep() {
    return step === childrenArray.length - 1;
  }

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
        } else {
          setStep((s) => s + 1);
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step key={child.props.label} completed={step > index || completed}>
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentChild}

          <Grid container spacing={2}>
            {step > 0 ? (
              <Grid item>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              </Grid>
            ) : null}
            <Grid item>
              <Button
                startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {isSubmitting ? 'Submitting' : isLastStep() ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
