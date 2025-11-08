"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
// import { GetAllSalaryStructureDatapoint } from "@/app/employee-central/letter-management/api/datapoints";

// ✅ Utility: Convert snake_case → Capitalized Label
function toLabel(str: string) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ✅ Base field map
const baseFieldMap: Record<string, string[]> = {
  "employee profile": [
    "prefix",
    "first_name",
    "middle_name",
    "last_name",
    "biometric_code",
    "employee_code",
    "gender",
    "father_name",
    "spouse_name",
    "official_email",
    "personal_email",
    "mobile_number",
    "aadhar_number",
    "pan_number",
    "employee_type",
    "contract_start_date",
    "contract_end_date",
    "date_of_birth",
    "date_of_joining",
    "date_of_probation",
    "date_of_confirmation",
    "scheduled_confirmation_date",
    "date_of_exit",
    "pf_joining_date",
    "pension_joining_date",
    "pf_applicable",
    "pension_applicable",
    "lwf_applicable",
    "esic_applicable",
    "pt_applicable",
    "reporting_manager",
    "company",
    "department",
    "project",
    "grade",
    "division",
    "shift",
    "designation",
    "location",
  ],

  "company directory": [
    "company_code",
    "company_name",
    "display_name",
    "hr_employee_code",
    "pf_registration_name",
    "esic_registration_name",
    "pt_registration_name",
    "lwf_registration_name",
    "tan_registration_name",
    "gst_number",
    "cin_number",
    "street_address",
    "apartment",
    "city",
    "state",
    "zip_code",
    "country",
    "phone",
    "email",
    "website",
  ],

  "employee personal information": [
    "current_street_address",
    "current_apartment_info",
    "current_city",
    "current_state",
    "current_zip_code",
    "current_country",
    "is_same_as_permanent",
    "permanent_street_address",
    "permanent_apartment_info",
    "permanent_city",
    "permanent_state",
    "permanent_zip_code",
    "permanent_country",
    "mother_name",
    "emergency_contact_name",
    "emergency_contact_number",
    "marital_status",
    "nationality",
    "category",
    "religion",
    "blood_group",
    "whatsapp_number",
    "type_of_disability",
    "physical_disability_status",
    "signature_file_url",
  ],

  "employee education": [
    "education_level",
    "course_degree_name",
    "specialization",
    "university_institute",
    "percent_grade",
    "mode_of_education",
    "is_highest_education",
    "document_file_url",
  ],

  "employee family info": [
    "name",
    "gender",
    "date_of_birth",
    "relationship",
    "phone",
    "email",
    "is_dependent",
    "reason_for_dependence",
    "is_earning_member",
    "monthly_income",
    "pf_nominee",
    "pension_nominee",
    "gratuity_nominee",
    "lic_nominee",
    "include_in_mediclaim",
    "include_in_insurance",
  ],

  "employee skill": [
    "skill_category",
    "skill_name",
    "skill_description",
    "is_core_skill",
    "proficiency_level",
    "competency_rating",
    "certificate_name",
    "certificate_file_url",
  ],

  "work experience": [
    "organization_name",
    "employment_type",
    "start_date",
    "end_date",
    "relieving_letter_url",
    "verification_status",
    "verification_date",
    "verified_by",
    "total_experience",
  ],

  "Salary Structure": [
    "salary_structure",
    "gross_earning",
    "net_pay",
    "total_deduction",
  ],

  "Bank Details": ["bank_details"],
  "Contract Details": ["contract_details"],
  Documents: ["documents"],
  Education: ["education"],
  "Family Info": ["family_info"],
  "KYC Documents": ["kyc_documents"],
  "Personal Info": ["personal_info"],
};

const categories = Object.keys(baseFieldMap).map((key) => ({
  value: key,
  label: toLabel(key),
}));

export default function FieldInsert({
  onInsert,
}: {
  onInsert: (field: string) => void;
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");
  const [fieldOpen, setFieldOpen] = useState(false);
  const [fieldMap, setFieldMap] =
    useState<Record<string, string[]>>(baseFieldMap);
  const [salaryHeads, setSalaryHeads] = useState<
    { salary_head_name: string; salary_type: string }[]
  >([]);

  useEffect(() => {
    const fetchSalaryDatapoints = async () => {
      // Mock data since GetAllSalaryStructureDatapoint is commented out
      const mockData = {
        data: [
          {
            calculation_table: {
              calculation_heads: [
                { salary_head_name: "Basic Salary", salary_type: "EARNING" },
                { salary_head_name: "HRA", salary_type: "EARNING" },
                { salary_head_name: "PF", salary_type: "DEDUCTION" },
              ],
            },
          },
        ],
      };

      try {
        // const res = await GetAllSalaryStructureDatapoint(0, 1);
        const res = mockData;

        if (res?.data?.length > 0) {
          type CalculationHead = {
            salary_head_name: string;
            salary_type: "EARNING" | "DEDUCTION" | string;
          };

          const calcHeads: CalculationHead[] =
            res.data[0]?.calculation_table?.calculation_heads || [];

          const salaryFields = calcHeads
            .filter(
              (h): h is CalculationHead =>
                typeof h.salary_head_name === "string" &&
                typeof h.salary_type === "string"
            )
            .map((h) => h.salary_head_name);

          setSalaryHeads(calcHeads);

          setFieldMap((prev) => ({
            ...prev,
            "Salary Structure": [...prev["Salary Structure"], ...salaryFields],
          }));
        }
      } catch (error) {
        console.error("Error fetching salary structure datapoints:", error);
      }
    };

    fetchSalaryDatapoints();
  }, []);

  const fields = useMemo(() => {
    if (!categoryValue) return [];
    return fieldMap[categoryValue] || [];
  }, [categoryValue, fieldMap]);

  return (
    <div className="flex items-center gap-4">
      {/* Category Combo Box */}
      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
        <PopoverTrigger asChild>
          <Button
            size="xs"
            variant="outline"
            role="combobox"
            aria-expanded={categoryOpen}
            className="w-[170px] justify-between overflow-hidden text-ellipsis whitespace-nowrap"
          >
            <span className="truncate max-w-[120px]">
              {categoryValue
                ? categories.find((c) => c.value === categoryValue)?.label
                : "Select category..."}
            </span>
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[270px] p-0 bg-white shadow-lg border border-gray-200 "
          sideOffset={4}
          onWheel={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="Search category..." className="h-9" />
            <CommandList className="max-h-[250px] overflow-y-auto">
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.value}
                    value={category.value}
                    onSelect={(currentValue) => {
                      setCategoryValue(currentValue);
                      setCategoryOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-200 transition-colors"
                    )}
                  >
                    {category.label}
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3",
                        categoryValue === category.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Field Combo Box */}
      <Popover open={fieldOpen} onOpenChange={setFieldOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="xs"
            role="combobox"
            aria-expanded={fieldOpen}
            disabled={!categoryValue}
            className="w-[170px] justify-between"
          >
            Select field...
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[230px] p-0 bg-white shadow-lg border border-gray-200"
          sideOffset={4}
          onWheel={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="Search field..." className="h-9" />
            <CommandList className="max-h-[250px] overflow-y-auto">
              <CommandEmpty>No field found.</CommandEmpty>
              <CommandGroup>
                {fields.map((field) => {
                  // find salary type for label display
                  const salaryHead = salaryHeads.find(
                    (h) => h.salary_head_name === field
                  );
                  const label = salaryHead
                    ? `${salaryHead.salary_head_name} (${salaryHead.salary_type})`
                    : toLabel(field);

                  return (
                    <CommandItem
                      key={field}
                      value={field}
                      onSelect={() => {
                        onInsert(`{{${field}}}`);
                        setFieldOpen(false);
                      }}
                      className="cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-200 transition-colors"
                    >
                      {label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
