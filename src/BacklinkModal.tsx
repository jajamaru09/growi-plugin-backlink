import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
    onClose: () => void;
};

const BacklinkModal = ({ onClose }: Props) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return createPortal(
        <>
            <div className="modal-backdrop fade show" onClick={onClose} />
            <div className="modal d-block" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">バックリンク</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <p>（バックリンクの一覧）</p>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
};

export default BacklinkModal;
