"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { accountSchema } from "@/app/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isValid, parse } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import CitySelector from "./CitySelector";
import ProvinceSelector from "./ProvinceSelector";
import RegionSelector from "./RegionSelector";
import RDOSelector from "./RDOselector";

const CreateAccountDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [isIndividual, setIsIndividual] = useState(null);
  const [radioSelected, setRadioSelected] = useState(false); // Track if a radio button is selected


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "",
      isIndividual: false,
      street: "",
      buildingNumber: "",
      town: "",
      city: "",
      zip: "",
      province: "",
      region: "",
      businessLine: "",
      tin: ["", "", "", ""],
      RDO: "",
      birthDate: "",
      contactNumber: "",
      email: "",
      isHeadOffice: false,
      branchCount: "",
      owner: "",
    },
  });

  const {
    data: newAccount,
    error: errorAccount,
    fn: createAccountFn,
    loading: createAccountLoading,
  } = useFetch(createAccount);

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setIsIndividual(null);
      setOpen(false);
    }
  }, [createAccountLoading, newAccount]);

  useEffect(() => {
    if (errorAccount) {
      console.error("Failed to create account");
    }
  }, [errorAccount]);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      birthDate: data.birthDate.toISOString(),
      tin: data.tin.map((segment) => parseInt(segment, 10)), // Convert TIN segments to integers
      contactNumber: data.contactNumber,
      branchCount: Number(data.branchCount),
    };

    await createAccountFn(formData);
  };

  const enableBranchCount = watch("isHeadOffice");
  const handleSwitchChange = (checked) => {
    setValue("isHeadOffice", checked);
    setValue("branchCount", "");
  };

  const handleAccountTypeChange = (value) => {
    setIsIndividual(value === "individual");
    setRadioSelected(true);
    setValue("isIndividual", value === "individual");
    setValue("type", "");
  };

  const accountTypeOptions = isIndividual
    ? [
        { value: "FREELANCE", label: "Freelance" },
        { value: "PROFESSIONAL", label: "Professional" },
        { value: "SOLEPROPRIETORSHIP", label: "Sole Proprietorship" },
      ]
    : [
        { value: "INCORPORATION", label: "Incorporation" },
        { value: "PARTNERSHIP", label: "Partnership" },
        { value: "COOPERATIVE", label: "Cooperative" },
        { value: "ASSOCIATION", label: "Association" },
        { value: "CORPORATION", label: "Corporation" },
      ];

  const handleCancelForm = () => {
    reset(); // Reset all form fields to their default values
    // setOpen(false); // Close the dialog
    setValue("province", ""); // Reset Province field
    setValue("city", ""); // Reset City field
    setValue("region", "");
    setRadioSelected(false); // Reset the radio group selection
    setIsIndividual(null);
  } 










      
  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>{children}</DialogTrigger>
    
    <DialogContent 
      className="
        [&>button]:hidden
        w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl
        mx-auto
        px-2 sm:px-4 md:px-4 py-4 md:py-4
        bg-background border-border shadow-lg rounded-lg
      "
    >
      <DialogHeader className="space-y-0 px-2">
        <DialogTitle  className="text-2xl font-bold">
          <label className="text-center lg:text-start">Add Account</label>
        </DialogTitle>
      <DialogDescription>
        Fill out the form to create an account for a client.
      </DialogDescription>
      </DialogHeader>
       <ScrollArea className="max-h-[80vh]">
          <form className="space-y-6 px-2" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <div>
              <h2 className="text-lg font-semibold">Client's Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="min-w-0">
                  <label htmlFor="name" className="text-sm font-medium">
                    Business name <span className="text-red-600">*</span>
                  </label>
                  <Input id="name" placeholder="Business name" className="w-full" {...register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="owner" className="text-sm font-medium">
                    Owner's name<span className="text-red-600">*</span>
                  </label>
                  <Input id="owner" placeholder="Owner's name" className="w-full" {...register("owner")} />
                  {errors.owner && <p className="text-sm text-red-500">{errors.owner.message}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="contactNumber" className="text-sm font-medium">
                    Contact number<span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="contactNumber"
                    type="text"
                    placeholder="Contact number"
                    className="w-full"
                    {...register("contactNumber", {
                      required: "Contact number is required",
                      validate: (value) => {
                        const isValidLength = value.toString().length === 11;
                        return isValidLength || "Contact number must be exactly 11 digits";
                      },
                    })}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      if (e.target.value.length > 11) {
                        e.target.value = e.target.value.slice(0, 11);
                      }
                    }}
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
                  )}
                </div>
                <div className="min-w-0">
                  <label htmlFor="businessLine" className="text-sm font-medium">
                    Business line<span className="text-red-600">*</span>
                  </label>
                  <Input id="businessLine" placeholder="Line of Business" className="w-full" {...register("businessLine")} />
                  {errors.businessLine && <p className="text-sm text-red-500">{errors.businessLine.message}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email<span className="text-red-600">*</span>
                  </label>
                  <Input id="email" type="email" placeholder="Email" className="w-full" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="birthDate" className="text-sm font-medium">
                    Company's Birth date<span className="text-red-600">*</span>
                  </label>
                  <Input id="birthDate" type="date" className="w-full" {...register("birthDate")} />
                  {errors.birthDate && <p className="text-sm text-red-500">{"Birth Date is required" || errors.birthDate.message}</p>}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h2 className="text-lg font-semibold">Business Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="min-w-0">
                  <label htmlFor="buildingNumber" className="text-sm font-medium">
                    House/Building number<span className="text-red-600">*</span>
                  </label>
                  <Input id="buildingNumber" placeholder="House/Building number" className="w-full" {...register("buildingNumber")} />
                  {errors.buildingNumber && <p className="text-sm text-red-500">{errors.buildingNumber.message}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="street" className="text-sm font-medium">
                    Street address<span className="text-red-600">*</span>
                  </label>
                  <Input id="street" placeholder="Street address" className="w-full" {...register("street")} />
                  {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="town" className="text-sm font-medium">
                    Barangay<span className="text-red-600">*</span>
                  </label>
                  <Input id="town" placeholder="Barangay" className="w-full" {...register("town")} />
                  {errors.town && <p className="text-sm text-red-500">{errors.town.message}</p>}
                </div>
                <div className="min-w-0">
                  <CitySelector register={register} setValue={setValue} errors={errors} className="w-full" />
                </div>
                <div className="min-w-0">
                  <label htmlFor="zip" className="text-sm font-medium">
                    Zip code<span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="zip"
                    type="text"
                    placeholder="Zip code"
                    className="w-full"
                    {...register("zip", {
                      required: "Zip code is required",
                      validate: (value) => {
                        const isValidLength = value.toString().length === 4;
                        return isValidLength || "Invalid zip code.";
                      },
                    })}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      if (e.target.value.length > 4) {
                        e.target.value = e.target.value.slice(0, 4);
                      }
                    }}
                  />
                  {errors.zip && <p className="text-sm text-red-500">{errors.zip.message}</p>}
                </div>
                <div className="min-w-0">
                  <ProvinceSelector register={register} setValue={setValue} errors={errors} className="w-full" />
                </div>
                <div className="min-w-0">
                  <RegionSelector register={register} setValue={setValue} errors={errors} className="w-full" />
                </div>
              </div>
            </div>

            {/* Tax Information Section */}
            <div>
              <h2 className="text-lg font-semibold">Background Tax Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Left Side */}
                <div className="space-y-4 min-w-0">
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label htmlFor="isHeadOffice" className="text-sm font-medium">Set as head office</label>
                        <p className="text-sm text-muted-foreground">This account is for the head office of the company.</p>
                      </div>
                      <Switch id="isHeadOffice" onCheckedChange={handleSwitchChange} checked={enableBranchCount} />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="branchCount"
                      className={`text-sm font-medium ${
                        enableBranchCount ? "text-gray-900" : "text-gray-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      Branch Count
                    </label>
                    <Input
                      id="branchCount"
                      type="number"
                      placeholder="0"
                      className="w-full"
                      {...register("branchCount", {
                        required: enableBranchCount ? "Branch count is required" : false,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Branch count must only contain digits",
                        },
                      })}
                      disabled={!enableBranchCount}
                    />
                    {errors.branchCount && <p className="text-sm text-red-500">{errors.branchCount.message}</p>}
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-4 min-w-0">
                  <div>
                    <label htmlFor="type" className="text-sm font-medium flex flex-col sm:flex-row sm:items-center">
                      <span>
                        Business category<span className="text-red-600">*</span>
                      </span>
                      <RadioGroup
                        value={isIndividual === null ? "" : isIndividual ? "individual" : "non-individual"}
                        onValueChange={(value) => {
                          setIsIndividual(value === "individual");
                          handleAccountTypeChange(value);
                        }}
                        defaultValue=""
                        className="flex flex-row space-x-4 mt-2 sm:mt-0 sm:ml-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="individual" />
                          <label htmlFor="individual" className="text-sm">Individual</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non-individual" id="non-individual" />
                          <label htmlFor="non-individual" className="text-sm">Non-Individual</label>
                        </div>
                      </RadioGroup>
                    </label>
                    {radioSelected && (
                      <Select
                        onValueChange={(value) => setValue("type", value)}
                        defaultValue={watch("type")}
                        disabled={!radioSelected}
                      >
                        <SelectTrigger id="type" className="w-full mt-2">
                          <SelectValue placeholder={<p className="text-sm text-neutral-500">Select a business type.</p>} />
                        </SelectTrigger>
                        <SelectContent>
                          {accountTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.type && (
                      <p className="text-sm text-red-500">
                        {"Business type is required." || errors.type.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="tin" className="text-sm font-medium">
                      TIN number<span className="text-red-600">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Input
                          key={index}
                          id={`tin-segment-${index}`}
                          type="text"
                          maxLength={index === 3 ? 5 : 3}
                          placeholder={index === 3 ? "12345" : "123"}
                          className="w-16 sm:w-20 text-center border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                          {...register(`tin.${index}`, {
                            required: "This field is required",
                            validate: (value) => /^\d+$/.test(value) || "Only numeric values are allowed",
                          })}
                          onInput={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            e.target.value = value.slice(0, index === 3 ? 5 : 3);
                            if (value.length === (index === 3 ? 5 : 3) && index < 3) {
                              document.getElementById(`tin-segment-${index + 1}`)?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    {errors.tin && (
                      <p className="text-sm text-red-500">
                        {errors.tin.message || "Please fill in all the blanks."}
                      </p>
                    )}
                  </div>
                  <div>
                    <RDOSelector register={register} setValue={setValue} errors={errors} className="w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" 
                className="
                flex-1 text-black border
                border-rose-500 hover:border-0 
                hover:bg-rose-500 hover:text-white
                hover:shadow-lg hover:shadow-rose-500/50
                " 
                disabled={createAccountLoading}>
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" 
              className="flex-1 bg-white hover:bg-black 
              text-black hover:text-white
              border hover:border-0 border-black hover:shadow-lg hover:shadow-black/50" 
              disabled={createAccountLoading}>
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  "Add Client"
                )}
              </Button>
              <Button variant="outline" type="button" onClick={handleCancelForm} 
                className="flex-1 bg-white hover:bg-yellow-400 
                text-black hover:text-white
                  border hover:border-0 border-yellow-400 
                  hover:shadow-lg hover:shadow-yellow-400/50" 
                disabled={createAccountLoading}>
                Restart filling in
              </Button>
            </div>
          </form>
        </ScrollArea>
    </DialogContent>
  </Dialog>
  );
};

export default CreateAccountDrawer;