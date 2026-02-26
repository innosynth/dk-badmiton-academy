import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, User, Users, Briefcase, FileText, Upload, ChevronRight, ChevronLeft, Loader2, Dumbbell, GraduationCap } from "lucide-react";
import badmintonHero from "@/assets/badminton-hero.png";
import { toast } from "sonner";

const schema = z.object({
  // Type
  type: z.enum(["student", "member"]).default("student"),
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
  studentSignature: z.string().min(1, "Signature is required"),
  declarationDate: z.string().optional(),
  proofType: z.string().optional(),
  // URLs (filled after upload)
  photoUrl: z.string().optional(),
  proofUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = [
  { id: 0, label: "Details", icon: User },
  { id: 1, label: "Parents", icon: Users },
  { id: 2, label: "Office", icon: Briefcase },
  { id: 3, label: "Declare", icon: FileText },
];

const today = new Date().toISOString().split("T")[0];

const FormField = ({ label, name, register, error, type = "text", placeholder, className = "", readOnly = false }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
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

const SelectField = ({ label, name, register, options, className = "" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    <select
      {...register(name)}
      className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
    >
      <option value="">Select {label}</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default function RegistrationForm() {
  const [regType, setRegType] = useState<"student" | "member" | null>(null);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, trigger, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "student" }
  });

  useEffect(() => {
    setValue("enrollmentDate", today);
    setValue("declarationDate", today);
  }, [setValue]);

  const handleNext = async () => {
    const fieldsToValidate: (keyof FormData)[] | undefined = step === 0 ? ["studentName"] : undefined;
    const valid = fieldsToValidate ? await trigger(fieldsToValidate) : true;

    if (valid) {
      if (regType === "member" && step === 0) {
        setStep(2); // Skip Step 1 (Parents)
      } else {
        setStep((s) => Math.min(s + 1, steps.length - 1));
      }
    }
  };

  const handleBack = () => {
    if (regType === "member" && step === 2) {
      setStep(0);
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const uploadFile = async (file: File) => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
    });
    if (!response.ok) throw new Error("Upload failed");
    const blob = await response.json();
    return blob.url;
  };

  const onSubmit = async (data: FormData) => {
    if (step < steps.length - 1) return;
    setIsSubmitting(true);

    try {
      let finalData = { ...data, type: regType };

      // Upload files if they exist
      if (photoFile) {
        toast.loading("Uploading photo...");
        finalData.photoUrl = await uploadFile(photoFile);
      }
      if (proofFile) {
        toast.loading("Uploading proof...");
        finalData.proofUrl = await uploadFile(proofFile);
      }

      toast.loading("Saving registration details...");
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) throw new Error("Failed to save registration");

      setSubmitted(true);
      toast.dismiss();
      toast.success("Registration completed successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lime/20">
            <CheckCircle className="h-10 w-10 text-lime-dark" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-navy">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-6">Welcome to D K Badminton Academy.</p>
          <button
            onClick={() => { setSubmitted(false); setStep(0); setRegType(null); }}
            className="rounded-xl bg-navy px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-dark transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  // Initial Type Selection
  if (!regType) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-xl w-full text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-navy tracking-tight">Welcome to DK Academy</h1>
              <p className="text-muted-foreground">Select your enrollment type to continue</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => { setRegType("student"); setValue("type", "student"); }}
                className="group relative overflow-hidden rounded-3xl border-2 border-border bg-card p-8 text-left transition-all hover:border-navy hover:shadow-xl active:scale-95"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5 text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-navy">Student</h3>
                <p className="mt-2 text-sm text-muted-foreground">For junior players joining our coaching programs and academy squads.</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy group-hover:gap-4 transition-all">
                  Continue <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              <button
                onClick={() => { setRegType("member"); setValue("type", "member"); }}
                className="group relative overflow-hidden rounded-3xl border-2 border-border bg-card p-8 text-left transition-all hover:border-lime-dark hover:shadow-xl active:scale-95"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/10 text-lime-dark group-hover:bg-lime-dark group-hover:text-white transition-colors">
                  <Dumbbell className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-navy">Member</h3>
                <p className="mt-2 text-sm text-muted-foreground">For professional players and adults looking for court membership and play.</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-dark group-hover:gap-4 transition-all">
                  Continue <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
        <footer className="p-8 text-center text-xs text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} D K Badminton Academy. All rights reserved.
        </footer>
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
          <button
            onClick={() => setRegType(null)}
            className="mb-8 text-xs font-bold text-white/60 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Change Registration Type
          </button>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-xs font-semibold text-lime uppercase">
            ✦ {regType === "student" ? "Student" : "Member"} & Enrollment
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">
            D K Badminton<br />
            <span style={{ color: "hsl(var(--lime))" }}>Academy</span>
          </h1>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.filter(s => regType === "student" || s.id !== 1).map((s, i, arr) => {
              const Icon = s.icon;
              const actualStepIndex = steps.findIndex(stepObj => stepObj.id === s.id);
              const isActive = actualStepIndex === step;
              const isDone = actualStepIndex < step;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${isDone ? "bg-lime text-secondary-foreground" : isActive ? "bg-navy text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"}`}>
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-navy" : isDone ? "text-lime-dark" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`mx-2 flex-1 h-0.5 rounded-full transition-all ${isDone ? "bg-lime" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {step === 0 && (
          <div className="space-y-6">
            <SectionHeader title={`${regType === "student" ? "Student" : "Member"} Information`} subtitle="Basic details of the applicant" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-4">
                  <FormField label="Full Name *" name="studentName" register={register} error={errors.studentName?.message} />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <FormField label="Date of Birth" name="dob" register={register} type="date" />
                    <FormField label="Age" name="age" register={register} placeholder="Age" />
                    <SelectField label="Sex" name="sex" register={register} options={["Male", "Female", "Other"]} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex h-28 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-navy/30 bg-muted transition-colors hover:border-navy/60" onClick={() => document.getElementById("photo-upload")?.click()}>
                    {photoPreview ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-1 p-2 text-center"><Upload className="h-5 w-5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Photo</span></div>}
                  </div>
                  <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); } }} />
                  <span className="text-xs text-muted-foreground">Passport Size</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nationality" name="nationality" register={register} />
                <FormField label={regType === "student" ? "School Name" : "Occupation"} name={regType === "student" ? "schoolName" : "occupation"} register={register} />
                <FormField label="Area" name="area" register={register} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && regType === "student" && (
          <div className="space-y-6">
            <SectionHeader title="Parent / Guardian Details" subtitle="Contact information for both parents" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div><h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-lime inline-block" /> Father's Details</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><FormField label="Father's Name" name="fatherName" register={register} className="sm:col-span-1" /><FormField label="Contact No." name="fatherContact" register={register} type="tel" /><FormField label="Email ID" name="fatherEmail" register={register} type="email" error={errors.fatherEmail?.message} /></div></div>
              <div className="border-t border-border pt-6"><h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-lime inline-block" /> Mother's Details</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><FormField label="Mother's Name" name="motherName" register={register} className="sm:col-span-1" /><FormField label="Contact No." name="motherContact" register={register} type="tel" /><FormField label="Email ID" name="motherEmail" register={register} type="email" error={errors.motherEmail?.message} /></div></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader title="For Office Use Only" subtitle="To be filled by academy staff" />
            <div className="rounded-2xl border-2 border-dashed border-navy/20 bg-navy/5 p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField label="T-Shirt Size" name="tshirtSize" register={register} options={["XS", "S", "M", "L", "XL", "XXL"]} />
                <FormField label="No. of Sessions / Month" name="sessionsPerMonth" register={register} type="number" />
                <FormField label="Enrollment Date" name="enrollmentDate" register={register} type="date" readOnly />
                <FormField label="Fees Per Month (₹)" name="feesPerMonth" register={register} />
                <SelectField label="Squad / Level" name="squadLevel" register={register} options={["Beginner", "Intermediate", "Advanced", "Elite"]} className="sm:col-span-2" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <SectionHeader title="Declaration & Signature" subtitle="Please read and acknowledge the terms" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground space-y-2">
                <p>This is to certify that as on date of enrollment, the student has been examined by a physician and has been found to be <strong className="text-foreground">PHYSICALLY AND MENTALLY FIT</strong> to undergo the different activities of D K Badminton Academy.</p>
                <p>We are fully aware that the course fee we paid for is <strong className="text-foreground">non-transferable and non-refundable</strong> for whatever reason, under any circumstances.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full Name as Signature *" name="studentSignature" register={register} placeholder="Type your full name" error={errors.studentSignature?.message} />
                <FormField label="Date" name="declarationDate" register={register} type="date" readOnly />
              </div>
              <div className="space-y-3">
                <SelectField label="Proof of Identity Type" name="proofType" register={register} options={["Aadhaar Card", "PAN Card", "Driving Licence", "Passport", "Voter ID"]} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload Proof Document</label>
                  <div className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-navy/30 bg-muted/50 p-4 hover:border-navy/60 transition-colors" onClick={() => document.getElementById("proof-upload")?.click()}>
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-navy/10"><Upload className="h-5 w-5 text-navy" /></div>
                    <div className="flex-1 min-w-0">
                      {proofFileName ? <p className="text-sm font-semibold text-navy truncate">{proofFileName}</p> : <><p className="text-sm font-semibold text-foreground">Click to upload proof</p><p className="text-xs text-muted-foreground">JPG, PNG or PDF — max 5MB</p></>}
                    </div>
                  </div>
                  <input id="proof-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setProofFile(file); setProofFileName(file.name); if (file.type.startsWith("image/")) setProofPreview(URL.createObjectURL(file)); } }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button key="btn-back" type="button" onClick={handleBack} className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div key="btn-spacer" />}

          {step < steps.length - 1 ? (
            <button key="btn-next" type="button" onClick={handleNext} className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95" style={{ background: "var(--gradient-hero)" }}>
              Next Step <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button key="btn-submit" type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "var(--gradient-accent)", color: "hsl(var(--secondary-foreground))" }}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {isSubmitting ? "Processing..." : "Submit Registration"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function SectionHeader({ title, subtitle }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-1 rounded-full bg-lime" />
      <div><h2 className="text-2xl font-bold text-navy">{title}</h2><p className="text-sm text-muted-foreground">{subtitle}</p></div>
    </div>
  );
}
