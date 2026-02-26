import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, User, Users, Briefcase, FileText, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import badmintonHero from "@/assets/badminton-hero.png";

const schema = z.object({
  // Student Info
  studentName: z.string().min(1, "Required").max(100),
  dob: z.string().optional(),
  age: z.string().optional(),
  sex: z.string().optional(),
  nationality: z.string().optional(),
  schoolName: z.string().optional(),
  siblingsName: z.string().optional(),
  regNo: z.string().optional(),
  occupation: z.string().optional(),
  area: z.string().optional(),
  // Parent Info
  fatherName: z.string().optional(),
  fatherContact: z.string().optional(),
  fatherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  motherName: z.string().optional(),
  motherContact: z.string().optional(),
  motherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  // Office Use
  tshirtSize: z.string().optional(),
  sessionsPerMonth: z.string().optional(),
  enrollmentDate: z.string().optional(),
  feesPerMonth: z.string().optional(),
  squadLevel: z.string().optional(),
  // Declaration
  studentSignature: z.string().optional(),
  declarationDate: z.string().optional(),
  proofType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = [
  { id: 0, label: "Student", icon: User },
  { id: 1, label: "Parents", icon: Users },
  { id: 2, label: "Office", icon: Briefcase },
  { id: 3, label: "Declare", icon: FileText },
];

const today = new Date().toISOString().split("T")[0];

const FormField = ({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  className = "",
  readOnly = false,
}: {
  label: string;
  name: keyof FormData;
  register: ReturnType<typeof useForm<FormData>>["register"];
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </label>
    <input
      {...register(name)}
      type={type}
      placeholder={placeholder ?? label}
      readOnly={readOnly}
      className={`rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all ${readOnly ? "opacity-70 cursor-not-allowed bg-muted" : ""}`}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  name,
  register,
  options,
  className = "",
}: {
  label: string;
  name: keyof FormData;
  register: ReturnType<typeof useForm<FormData>>["register"];
  options: string[];
  className?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </label>
    <select
      {...register(name)}
      className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
    >
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Auto-fill today's date on mount
  useEffect(() => {
    setValue("enrollmentDate", today);
    setValue("declarationDate", today);
  }, [setValue]);

  const handleNext = async () => {
    const fieldsToValidate: (keyof FormData)[] | undefined = step === 0
      ? ["studentName"]
      : undefined;
    const valid = fieldsToValidate ? await trigger(fieldsToValidate) : true;
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit = (data: FormData) => {
    console.log("Registration Data:", data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lime/20">
            <CheckCircle className="h-10 w-10 text-lime-dark" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-navy">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Welcome to D K Badminton Academy. We'll review your application and get in touch soon.
          </p>
          <button
            onClick={() => { setSubmitted(false); setStep(0); }}
            className="rounded-xl bg-navy px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-dark transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10">
          <img src={badmintonHero} alt="" className="h-full w-full object-cover object-center" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-10 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-xs font-semibold text-lime">
            ✦ STUDENT & MEMBER ENROLLMENT
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">
            D K Badminton<br />
            <span style={{ color: "hsl(var(--lime))" }}>Academy</span>
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/70">
            SF No 417, Site No 9, Kalangal Road, Sulur, SULUR., Sulur
          </p>
          <div className="mt-2 flex gap-4 text-xs text-primary-foreground/60">
            <span>📞 +91 93631 41888</span>
            <span>📞 +91 90037 24071</span>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isDone
                          ? "bg-lime text-secondary-foreground"
                          : isActive
                          ? "bg-navy text-primary-foreground shadow-lg"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:block ${
                        isActive ? "text-navy" : isDone ? "text-lime-dark" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-2 flex-1 h-0.5 rounded-full transition-all ${
                        isDone ? "bg-lime" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Step 0: Student Info */}
        {step === 0 && (
          <div className="space-y-6">
            <SectionHeader title="Student Information" subtitle="Basic details of the student" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              {/* Photo Upload */}
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-4">
                  <FormField
                    label="Student Name *"
                    name="studentName"
                    register={register}
                    error={errors.studentName?.message}
                  />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <FormField label="Date of Birth" name="dob" register={register} type="date" />
                    <FormField label="Age" name="age" register={register} placeholder="Age" />
                    <SelectField
                      label="Sex"
                      name="sex"
                      register={register}
                      options={["Male", "Female", "Other"]}
                    />
                  </div>
                </div>
                {/* Photo */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative flex h-28 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-navy/30 bg-muted transition-colors hover:border-navy/60"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 p-2 text-center">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Passport Size</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nationality" name="nationality" register={register} />
                <FormField label="School Name" name="schoolName" register={register} />
                <FormField label="Siblings Name" name="siblingsName" register={register} />
                <FormField label="Registration No." name="regNo" register={register} />
                <FormField label="Occupation" name="occupation" register={register} />
                <FormField label="Area" name="area" register={register} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Parent Info */}
        {step === 1 && (
          <div className="space-y-6">
            <SectionHeader title="Parent / Guardian Details" subtitle="Contact information for both parents" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                  <span className="h-1 w-4 rounded-full bg-lime inline-block" /> Father's Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField label="Father's Name" name="fatherName" register={register} className="sm:col-span-1" />
                  <FormField label="Contact No." name="fatherContact" register={register} type="tel" />
                  <FormField label="Email ID" name="fatherEmail" register={register} type="email" error={errors.fatherEmail?.message} />
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                  <span className="h-1 w-4 rounded-full bg-lime inline-block" /> Mother's Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField label="Mother's Name" name="motherName" register={register} className="sm:col-span-1" />
                  <FormField label="Contact No." name="motherContact" register={register} type="tel" />
                  <FormField label="Email ID" name="motherEmail" register={register} type="email" error={errors.motherEmail?.message} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Office Use */}
        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader title="For Office Use Only" subtitle="To be filled by academy staff" />
            <div className="rounded-2xl border-2 border-dashed border-navy/20 bg-navy/5 p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField label="T-Shirt Size" name="tshirtSize" register={register} options={["XS", "S", "M", "L", "XL", "XXL"]} />
                <FormField label="No. of Sessions / Month" name="sessionsPerMonth" register={register} type="number" />
                <FormField
                  label="Enrollment Date"
                  name="enrollmentDate"
                  register={register}
                  type="date"
                  readOnly
                />
                <FormField label="Fees Per Month (₹)" name="feesPerMonth" register={register} />
                <SelectField
                  label="Squad / Level"
                  name="squadLevel"
                  register={register}
                  options={["Beginner", "Intermediate", "Advanced", "Elite"]}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Declaration */}
        {step === 3 && (
          <div className="space-y-6">
            <SectionHeader title="Declaration & Signature" subtitle="Please read and acknowledge the terms" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground space-y-2">
                <p>
                  This is to certify that as on date of enrollment, the student has been examined by a physician and has been found to be <strong className="text-foreground">PHYSICALLY AND MENTALLY FIT</strong> to undergo the different activities of D K Badminton Academy.
                </p>
                <p>
                  I have attached a Medical Fitness Performa issued by (D K Badminton Academy) duly filled in by my doctor. Authenticity of the doctor and doctor's report are purely my responsibility.
                </p>
                <p>
                  We are fully aware that the course fee we paid for is <strong className="text-foreground">non-transferable and non-refundable</strong> for whatever reason, under any circumstances. The payment made by me is by calendar month (from first to last date of the month).
                </p>
                <p>
                  We have read and fully understood the Terms and Conditions, and we agree to the terms and conditions herein and undertake to comply with them, as evidence by our signatures herein below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Student Signature" name="studentSignature" register={register} placeholder="Full name as signature" />
                <FormField
                  label="Date"
                  name="declarationDate"
                  register={register}
                  type="date"
                  readOnly
                />
              </div>

              {/* ID Proof Upload */}
              <div className="space-y-3">
                <SelectField
                  label="Proof of Identity Type"
                  name="proofType"
                  register={register}
                  options={["Aadhaar Card", "PAN Card", "Driving Licence", "School ID Card", "Passport", "Voter ID"]}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upload Proof Document
                  </label>
                  <div
                    className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-navy/30 bg-muted/50 p-4 hover:border-navy/60 transition-colors"
                    onClick={() => document.getElementById("proof-upload")?.click()}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-navy/10">
                      <Upload className="h-5 w-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {proofFileName ? (
                        <>
                          <p className="text-sm font-semibold text-navy truncate">{proofFileName}</p>
                          <p className="text-xs text-muted-foreground">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-foreground">Click to upload proof</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG or PDF — max 5MB</p>
                        </>
                      )}
                    </div>
                    {proofPreview && (
                      <img src={proofPreview} alt="Proof preview" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                    )}
                  </div>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProofFileName(file.name);
                        if (file.type.startsWith("image/")) {
                          setProofPreview(URL.createObjectURL(file));
                        } else {
                          setProofPreview(null);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-lime/30 bg-lime/5 p-4">
                <p className="text-xs font-semibold text-navy mb-2">Documents Required at Registration:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-lime flex-shrink-0" /> Two recent passport size photographs; Aadhaar card copy</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-lime flex-shrink-0" /> Medical fitness certificate from Authorised Doctor (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--gradient-hero)" }}
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--gradient-accent)", color: "hsl(var(--secondary-foreground))" }}
            >
              <CheckCircle className="h-4 w-4" /> Submit Registration
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-1 rounded-full bg-lime" />
      <div>
        <h2 className="text-2xl font-bold text-navy">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
