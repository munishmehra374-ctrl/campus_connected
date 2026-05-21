interface Props {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-form confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{title}</h3>
            <p className="modal-hint">{message}</p>
            <div className="modal-actions">
                <button type="button" className="btn-outline btn-cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button type="button" className="btn-danger-solid" onClick={onConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmModal;
