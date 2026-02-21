import { useCallback, useState } from 'react';
import BacklinkModal from './BacklinkModal';

type Props = {
    cssModuleClass: string;
    pageId: string;
};

const BacklinkButton = ({ cssModuleClass, pageId }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleClose = useCallback(() => setIsOpen(false), []);

    return (
        <>
            <div className="d-flex">
                <button
                    type="button"
                    className={`btn btn-outline-neutral-secondary ${cssModuleClass} rounded-pill py-1 px-lg-3`}
                    onClick={() => setIsOpen(true)}
                >
                    <span className="grw-icon d-flex me-lg-2">
                        <span className="material-symbols-outlined">link</span>
                    </span>
                    <span className="grw-labels d-none d-lg-flex">バックリンク</span>
                </button>
            </div>
            {isOpen && <BacklinkModal pageId={pageId} onClose={handleClose} />}
        </>
    );
};

export default BacklinkButton;
