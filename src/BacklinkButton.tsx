import { useCallback, useState } from 'react';
import BacklinkModal from './BacklinkModal';

type Props = {
    cssModuleClass: string;
};

const BacklinkButton = ({ cssModuleClass }: Props) => {
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);

    const handleOpen = useCallback(() => {
        setCurrentPageId(window.location.pathname.slice(1));
    }, []);

    const handleClose = useCallback(() => setCurrentPageId(null), []);

    return (
        <>
            <div className="d-flex">
                <button
                    type="button"
                    className={`btn btn-outline-neutral-secondary ${cssModuleClass} rounded-pill py-1 px-lg-3`}
                    onClick={handleOpen}
                >
                    <span className="grw-icon d-flex me-lg-2">
                        <span className="material-symbols-outlined">link</span>
                    </span>
                    <span className="grw-labels d-none d-lg-flex">バックリンク</span>
                </button>
            </div>
            {currentPageId != null && <BacklinkModal pageId={currentPageId} onClose={handleClose} />}
        </>
    );
};

export default BacklinkButton;
