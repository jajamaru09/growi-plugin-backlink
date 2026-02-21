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
            <div className="modal-backdrop fade show" />
            <div className="modal d-block" tabIndex={-1} onClick={onClose}>
                <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <span className="material-symbols-outlined me-2" style={{ verticalAlign: 'middle', fontSize: '1.25rem' }}
                                >
                                    link
                                </span>
                                バックリンク</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            {loading && <p className="text-center text-muted">読み込み中...</p>}
                            {error && <p className="text-danger">{error}</p>}
                            {!loading && !error && pages.length === 0 && (
                                <p className="text-muted">バックリンクが見つかりませんでした</p>
                            )}
                            {!loading && !error && pages.length > 0 && (

                                <>
                                    <p className="text-muted small mb-3">
                                        <strong>{pages.length}</strong> 件のページがこのページを参照しています
                                    </p>
                                    <ul className="list-group list-group-flush">
                                        {pages.map(page => (
                                            <li key={page._id} className="list-group-item px-0">
                                                <span className="material-symbols-outlined fs-5 me-1" aria-hidden="true">description</span>
                                                <a href={page.path}>{page.path}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
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
