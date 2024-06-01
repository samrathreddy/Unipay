import { MenuItem,Box, Button, Card, CardContent, CircularProgress, Grid, Step, StepLabel, Stepper } from '@mui/material';
import { Field, Form, Formik, FormikConfig, FormikValues } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { mixed, number, object } from 'yup';

const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

export default function Home() {
  return (
    <Card>
      <CardContent>
        <FormikStepper
          initialValues={{
            firstName: '',
            lastName: '',
            PhoneNumber:'',
            Email:'',
            Agree: false,
            yearSem : '',
            money: 0,
            branch:'',
            description: '',
          }}
          onSubmit={async (values) => {
            await sleep(3000);
            console.log('values', values);
          }}
        >
          <FormikStep label="Personal Data">
            <Box paddingBottom={2}>
              <Field fullWidth name="firstName" component={TextField} label="First Name" />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="lastName" component={TextField} label="Last Name" />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="PhoneNumber" component={TextField} label="PhoneNumber" />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="Email" component={TextField} label="Email" />
            </Box>
            <Box paddingBottom={2}>
                <Field
                  name="yearSem"
                  component={TextField}
                  label="Choose Year-Semester"
                  select
                  fullWidth
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
                  label="Choose Your Branch"
                  select
                  fullWidth
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
                Label={{ label: 'I confirm that details are true' }}
              />
            </Box>
          </FormikStep>
          <FormikStep
            label="Bank Accounts"
            validationSchema={object({
              money: mixed().when('agree', {
                is: true,
                then: number()
                  .required()
                  .min(
                    1_000_000,
                    'Because you said you are a millionaire you need to have 1 million'
                  ),
                otherwise: number().required(),
              }),
            })}
          >
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="money"
                type="number"
                component={TextField}
                label="All the money I have"
              />
            </Box>
          </FormikStep>
          <FormikStep label="More Info">
            <Box paddingBottom={2}>
              <Field fullWidth name="description" component={TextField} label="Description" />
            </Box>
          </FormikStep>
        </FormikStepper>
      </CardContent>
    </Card>
  );
}

export interface FormikStepProps
  extends Pick<FormikConfig<FormikValues>, 'children' | 'validationSchema'> {
  label: string;
}

export function FormikStep({ children }: FormikStepProps) {
  return <>{children}</>;
}

export function FormikStepper({ children, ...props }: FormikConfig<FormikValues>) {
  const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
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

          // the next line was not covered in the youtube video
          //
          // If you have multiple fields on the same step
          // we will see they show the validation error all at the same time after the first step!
          //
          // If you want to keep that behaviour, then, comment the next line :)
          // If you want the second/third/fourth/etc steps with the same behaviour
          //    as the first step regarding validation errors, then the next line is for you! =)
          //
          // In the example of the video, it doesn't make any difference, because we only
          //    have one field with validation in the second step :)
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