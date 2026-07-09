"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { createId } from "@/lib/utils/id";
import { showToast } from "@/lib/utils/toast";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import type { ProjectRecord } from "@/lib/types/profile";

interface FormValues {
  records: ProjectRecord[];
}

const INPUT =
  "rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function ProjectRecordForm() {
  const projectRecords = useProfileStore((s) => s.projectRecords);
  const setProjectRecords = useProfileStore((s) => s.setProjectRecords);

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { records: projectRecords },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "records" });

  useEffect(() => {
    // Sync store -> form once, after zustand/persist has hydrated from localStorage.
    reset({ records: projectRecords });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(values: FormValues) {
    setProjectRecords(values.records);
    showToast("유사용역 실적이 저장되었습니다.");
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">유사용역 수행 실적</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            append({ id: createId(), projectName: "", client: "", contractPeriod: "" })
          }
        >
          + 실적 추가
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">
          등록된 실적이 없습니다. &ldquo;+ 실적 추가&rdquo;로 시작하세요.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              사업(용역)명
              <input className={INPUT} {...register(`records.${index}.projectName`)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              발주처
              <input className={INPUT} {...register(`records.${index}.client`)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              계약금액
              <input className={INPUT} {...register(`records.${index}.contractAmount`)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              계약기간
              <input className={INPUT} {...register(`records.${index}.contractPeriod`)} />
            </label>
            <label className="col-span-full flex flex-col gap-1 text-xs text-gray-500">
              개요
              <textarea
                className={`${INPUT} min-h-16`}
                {...register(`records.${index}.description`)}
              />
            </label>
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-xs text-red-500 hover:underline"
              >
                이 실적 삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Button onClick={handleSubmit(onSubmit)}>저장</Button>
      </div>
    </Card>
  );
}
