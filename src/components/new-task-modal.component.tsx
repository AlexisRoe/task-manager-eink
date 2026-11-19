import { useState } from "react";
import {
  DURATION_LABELS,
  DURATIONS,
  NOTES_MAX_LENGTH,
  PRIORITIES,
  PROJECTS,
  REPEAT_LABELS,
  REPEAT_OPTIONS,
  TASK_DEFAULTS,
  TITLE_MAX_LENGTH,
} from "@/constants/task.constants";
import { useTasksStore } from "@/store/tasks.store";
import type { IsoDate } from "@/types/task.types";
import { Button, Chip, Input, Modal, Text, TextArea, TimeInput } from "@/ui";
import { formatDate } from "@/utils/date.utils";
import { type TaskDraft, type TaskDraftErrors, validateTaskDraft } from "@/utils/validate.utils";

/** Props of {@link NewTaskModal}. */
export interface NewTaskModalProps {
  /** Date the task is created for. */
  date: IsoDate;
  onClose: () => void;
}

const initialDraft = (): TaskDraft => ({
  title: "",
  start: "",
  durationMin: TASK_DEFAULTS.durationMin,
  priority: TASK_DEFAULTS.priority,
  project: TASK_DEFAULTS.project,
  notes: "",
  repeat: TASK_DEFAULTS.repeat,
});

/** Single-choice chip row that ignores attempts to deselect the current choice. */
function ChoiceRow<T extends string | number>({
  label,
  options,
  value,
  format,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  format: (option: T) => string;
  onChange: (option: T) => void;
}) {
  return (
    <div className="new-task__row">
      <Text as="span">{label}</Text>
      <Chip.Group
        aria-label={label}
        value={String(value)}
        onChange={(next) => {
          const match = options.find((option) => String(option) === next);
          if (match !== undefined) onChange(match);
        }}
      >
        {options.map((option) => (
          <Chip key={String(option)} value={String(option)}>
            {format(option)}
          </Chip>
        ))}
      </Chip.Group>
    </div>
  );
}

/**
 * Form modal for creating a task. Input is validated and length-limited before it reaches the
 * store; a repeat other than "None" creates a recurring series anchored on the target date.
 */
export function NewTaskModal({ date, onClose }: NewTaskModalProps) {
  const addTask = useTasksStore((state) => state.addTask);
  const [draft, setDraft] = useState<TaskDraft>(initialDraft);
  const [errors, setErrors] = useState<TaskDraftErrors>({});
  const update = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const result = validateTaskDraft(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    addTask(result.value, date, result.repeat);
    onClose();
  };

  return (
    <Modal open title="New task" size="xl" onClosed={onClose} onAccept={submit}>
      <Modal.Close />
      <div className="new-task">
        <Text>
          {formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </Text>
        <Input
          value={draft.title}
          onChange={(value) => update("title", value)}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="What needs doing?"
          required
        >
          Title
        </Input>
        {errors.title ? <Text role="alert">{errors.title}</Text> : null}
        <div className="new-task__row">
          <TimeInput value={draft.start} onChange={(value) => update("start", value)}>
            Start
          </TimeInput>
          {draft.start === "" ? (
            <Text as="span">Leave empty for anytime</Text>
          ) : (
            <Button.Naked onClick={() => update("start", "")}>Anytime</Button.Naked>
          )}
        </div>
        {errors.start ? <Text role="alert">{errors.start}</Text> : null}
        <ChoiceRow
          label="Duration"
          options={DURATIONS}
          value={draft.durationMin as (typeof DURATIONS)[number]}
          format={(option) => DURATION_LABELS[option]}
          onChange={(option) => update("durationMin", option)}
        />
        <ChoiceRow
          label="Priority"
          options={PRIORITIES}
          value={draft.priority as (typeof PRIORITIES)[number]}
          format={(option) => `P${option}`}
          onChange={(option) => update("priority", option)}
        />
        <ChoiceRow
          label="Project"
          options={PROJECTS}
          value={draft.project as (typeof PROJECTS)[number]}
          format={(option) => option}
          onChange={(option) => update("project", option)}
        />
        <ChoiceRow
          label="Repeat"
          options={REPEAT_OPTIONS}
          value={draft.repeat as (typeof REPEAT_OPTIONS)[number]}
          format={(option) => REPEAT_LABELS[option]}
          onChange={(option) => update("repeat", option)}
        />
        <TextArea
          value={draft.notes}
          onChange={(value) => update("notes", value)}
          maxCharacters={NOTES_MAX_LENGTH}
        >
          Notes
        </TextArea>
        {errors.notes ? <Text role="alert">{errors.notes}</Text> : null}
      </div>
      <Modal.CloseButton>Cancel</Modal.CloseButton>
      <Modal.ActionButton>Add task</Modal.ActionButton>
    </Modal>
  );
}
