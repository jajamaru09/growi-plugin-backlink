import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { BacklinkPage } from './types';

type Props = {
    pages: BacklinkPage[];
    loading: boolean;
    error: string | null;
    onClose: () => void;
};

const BacklinkModal = ({ pages, loading, error, onClose }: Props) => {

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
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">バックリンク</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            {loading && <p className="text-center text-muted">読み込み中...</p>}
                            {error && <p className="text-danger">{error}</p>}
                            {!loading && !error && pages.length === 0 && (
                                <p className="text-muted">バックリンクが見つかりませんでした</p>
                            )}
                            {!loading && !error && pages.length > 0 && (
                                <ul className="list-group list-group-flush">
                                    {pages.map(page => (
                                        <li key={page._id} className="list-group-item px-0">
                                            <a href={page.path}>{page.path}</a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
};

export default BacklinkModal;
