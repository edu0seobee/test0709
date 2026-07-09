"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { createId } from "@/lib/utils/id";
import { showToast } from "@/lib/utils/toast";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import type { EngineerRecord } from "@/lib/types/profile";

interface FormValues {
  engineers: EngineerRecord[];
}

const INPUT =
  "rounded-md border border-hairline px-2.5 py-1.5 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link";

export function EngineerRecordForm() {
  const engineers = useProfileStore((s) => s.engineers);
  const setEngineers = useProfileStore((s) => s.setEngineers);

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { engineers },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "engineers" });

  useEffect(() => {
    reset({ engineers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(values: FormValues) {
    setEngineers(values.engineers);
    showToast("기술자 경력이 저장되었습니다.");
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">투입 기술자 경력</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ id: createId(), name: "", careerSummary: "" })}
        >
          + 기술자 추가
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-mute">
          등록된 기술자가 없습니다. &ldquo;+ 기술자 추가&rdquo;로 시작하세요.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-2 rounded-md border border-hairline p-3 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-xs text-mute">
              성명
              <input className={INPUT} {...register(`engineers.${index}.name`)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-mute">
              직급/직책
              <input className={INPUT} {...register(`engineers.${index}.position`)} />
            </label>
            <label className="col-span-full flex flex-col gap-1 text-xs text-mute">
              경력 요약
              <textarea
                className={`${INPUT} min-h-16`}
                {...register(`engineers.${index}.careerSummary`)}
              />
            </label>
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-xs text-error hover:underline"
              >
                이 기술자 삭제
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
