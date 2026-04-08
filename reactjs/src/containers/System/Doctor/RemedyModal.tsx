import React, { useState, useEffect, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import './RemedyModal.scss';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { CommonUtils } from '../../../utils';

interface RemedyModalProps {
  isOpenModal: boolean;
  dataModal: any;
  closeRemedyModal: () => void;
  sendRemedy: (data: { email: string; imgBase64: string }) => Promise<void>;
}

interface RemedyFormState {
  email: string;
  imgBase64: string;
}

const RemedyModal: React.FC<RemedyModalProps> = ({
  isOpenModal,
  dataModal,
  closeRemedyModal,
  sendRemedy,
}) => {
  const [formState, setFormState] = useState<RemedyFormState>({
    email: '',
    imgBase64: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update email when modal opens or dataModal changes
  useEffect(() => {
    if (isOpenModal && dataModal?.email) {
      setFormState((prev) => ({
        ...prev,
        email: dataModal.email,
      }));
    }
  }, [isOpenModal, dataModal]);

  // Handle email change
  const handleOnChangeEmail = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        email: event.target.value,
      }));
    },
    []
  );

  // Handle image file selection
  const handleOnChangeImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const data = event.target.files;
      if (data && data.length > 0) {
        const file = data[0];
        try {
          const base64 = await CommonUtils.getBase64(file);
          setFormState((prev) => ({
            ...prev,
            imgBase64: base64 as string,
          }));
        } catch (error) {
          console.error('Error reading file:', error);
          toast.error('Failed to read file');
        }
      }
    },
    []
  );

  // Handle send remedy
  const handleSendRemedy = useCallback(async () => {
    if (!formState.email.trim()) {
      toast.error('Vui lòng nhập email bệnh nhân');
      return;
    }

    if (!formState.imgBase64) {
      toast.error('Vui lòng chọn file hóa đơn');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendRemedy(formState);
      // Reset form after successful send
      setFormState({
        email: '',
        imgBase64: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, sendRemedy]);

  // Handle close modal - reset form
  const handleCloseModal = useCallback(() => {
    setFormState({
      email: '',
      imgBase64: '',
    });
    closeRemedyModal();
  }, [closeRemedyModal]);

  return (
    <Modal
      isOpen={isOpenModal}
      className={'booking-modal-container'}
      size="md"
      centered
      toggle={handleCloseModal}
    >
      <div className="modal-header">
        <h5 className="modal-title">Gửi hóa đơn khám bệnh</h5>
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={handleCloseModal}
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>
      <ModalBody>
        <div className="row">
          <div className="col-6 form-group">
            <label>Email bệnh nhân</label>
            <input
              className="form-control"
              type="email"
              value={formState.email}
              onChange={handleOnChangeEmail}
              placeholder="Nhập email"
            />
          </div>
          <div className="col-6 form-group">
            <label>Chọn file hóa đơn</label>
            <input
              className="form-control-file"
              type="file"
              onChange={handleOnChangeImage}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {formState.imgBase64 && (
              <small className="text-success">✓ File đã chọn</small>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleSendRemedy}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang gửi...' : 'Send'}
        </Button>
        <Button color="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RemedyModal;
