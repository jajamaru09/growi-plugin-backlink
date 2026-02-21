import { useState } from 'react';
import BacklinkModal from './BacklinkModal';
import { useBacklinks } from './useBacklinks';

type Props = {
    cssModuleClass: string;
};

const BacklinkButton = ({ cssModuleClass }: Props) => {
    const [pageId] = useState(() => window.location.pathname.slice(1));
    const { pages, loading, error } = useBacklinks(pageId);
    const [isOpen, setIsOpen] = useState(false);

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
                    {!loading && (
                        <span className="grw-count-badge px-2 badge bg-body-tertiary text-body-tertiary">{pages.length}</span>
                    )}
                </button>
            </div>
            {isOpen && (
                <BacklinkModal
                    pages={pages}
                    loading={loading}
                    error={error}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default BacklinkButton;
