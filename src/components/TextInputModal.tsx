import { FC, ReactNode, useState } from 'react';
import { ConfirmModalProps, ConfirmModal, TextField } from '@decky/ui';

export interface TextInputModalProps extends ConfirmModalProps {
  strInputPlaceholder?: string;
  value?: string;
  tooltip?: string;
  onChange?: (value: string) => void;
  onConfirm?: (value: string) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  mustBeEmail?: boolean;
  mustBeURL?: boolean;
  mustBeNumeric?: boolean;
  bMiddleDisabled?: boolean,
}

export const TextInputModal: FC<TextInputModalProps> = ({
  strTitle = 'Enter Text',
  strDescription,
  strOKButtonText = 'Confirm',
  strCancelButtonText = 'Cancel',
  value = '',
  label,
  description,
  disabled,
  mustBeEmail,
  mustBeURL,
  mustBeNumeric,
  bMiddleDisabled,
  tooltip,
  onChange,
  onConfirm,
  onCancel,
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleConfirm = () => {
    onConfirm?.(inputValue);
  };

  return (
    <ConfirmModal
      {...props}
      strTitle={strTitle}
      strDescription={strDescription}
      strOKButtonText={strOKButtonText}
      strCancelButtonText={strCancelButtonText}
      onOK={handleConfirm}  // Handle confirm action
      onCancel={onCancel}
      bMiddleDisabled={bMiddleDisabled}
    >
      <div>
        {strDescription && <p>{strDescription}</p>}
        <TextField
          label={label}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          mustBeEmail={mustBeEmail}
          mustBeURL={mustBeURL}
          mustBeNumeric={mustBeNumeric}
          focusOnMount
          tooltip={tooltip}
        />
      </div>
    </ConfirmModal>
  );
};
