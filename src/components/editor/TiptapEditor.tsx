// src/components/editor/TiptapEditor.tsx
"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { GoBold, GoItalic, GoPencil, GoPlus, GoQuote, GoTrash } from "react-icons/go";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useState } from 'react';

interface TiptapEditorProps {
    content?: any;
    onUpdate: (json: any) => void;
}

const TiptapEditor = ({ content, onUpdate }: TiptapEditorProps) => {

    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number, show: boolean }>({ top: 0, left: 0, show: false });
    const [bubbleMenu, setBubbleMenu] = useState<{ top: number, left: number, show: boolean }>({ top: 0, left: 0, show: false });

    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [editingImageAttrs, setEditingImageAttrs] = useState<{ src: string, alt: string } | null>(null);


    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ allowBase64: true }),
            Placeholder.configure({ placeholder: 'Anlatmaya başla...' }),
        ],
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getJSON());
            updateMenuPosition(editor); // Her güncellemede pozisyonu kontrol et
        },
        onSelectionUpdate: ({ editor }) => {
            updateMenuPosition(editor); // İmleç her hareket ettiğinde kontrol et
            updateBubbleMenu(editor); // Seçim her değiştiğinde kontrol et
        },
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-lg max-w-none focus:outline-none min-h-[500px]',
            },
        },
    });

    // Menü Pozisyonunu Hesapla
    const updateMenuPosition = (editor: any) => {
        // DOM'un güncellenmesini bekle (Mikro-delay)
        requestAnimationFrame(() => {
            if (!editor || editor.isDestroyed) return;

            const { selection } = editor.state;
            const { $from } = selection;

            // Satır boş mu? (Sadece boş satırda göster)
            const isLineEmpty = $from.parent.content.size === 0;

            if (isLineEmpty) {
                // Tiptap'ın o anki aktif (odaklanmış) HTML elementini direkt bulalım
                // EditorContent içindeki aktif satırı seçiyoruz
                const activeNode = editor.view.domAtPos($from.pos).node;
                let element = activeNode as HTMLElement;

                // Eğer node bir text node ise parent elementine çık (genellikle <p>)
                if (element.nodeType === 3) {
                    element = element.parentElement as HTMLElement;
                }

                const editorElement = document.querySelector('.tiptap');

                if (element && editorElement) {
                    const rect = element.getBoundingClientRect();
                    const editorRect = editorElement.getBoundingClientRect();

                    // Pozisyonu tam satır hizasına getiriyoruz
                    setMenuPosition({
                        top: rect.top - editorRect.top,
                        left: -50,
                        show: true,
                    });
                    return;
                }
            }
            setMenuPosition(prev => ({ ...prev, show: false }));
        });
    };

    const updateBubbleMenu = (editor: any) => {
        // EĞER ODAK BİR INPUT İÇİNDEYSE HİÇBİR ŞEY YAPMA
        if (document.activeElement?.tagName === 'INPUT') {
            return;
        }

        const { selection } = editor.state;

        // Eğer seçili olan şey bir "image" ise
        if (editor.isActive('image')) {
            const node = document.querySelector('.tiptap img.ProseMirror-selectednode');
            const editorElement = document.querySelector('.tiptap');

            if (node && editorElement) {
                const rect = node.getBoundingClientRect();
                const editorRect = editorElement.getBoundingClientRect();

                setBubbleMenu({
                    top: rect.top - editorRect.top - 50, // Görselin 50px üstünde dursun
                    left: (rect.left - editorRect.left) + (rect.width / 2) - 100, // Ortala (100 menü genişliğinin yarısı)
                    show: true,
                });
                return;
            }
        }

        setBubbleMenu(prev => ({ ...prev, show: false }));
    };

    const openAltModal = (editor: any) => {
        const attrs = editor.getAttributes('image');
        setEditingImageAttrs({ src: attrs.src, alt: attrs.alt || '' });
        setIsAltModalOpen(true);
    };

    const saveAltText = (editor: any, newAlt: string) => {
        editor.chain().focus().updateAttributes('image', { alt: newAlt }).run();
        setIsAltModalOpen(false);
    };

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                const reader = new FileReader();

                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    editor?.chain().focus().setImage({ src: url }).run();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    if (!editor) return null;

    return (
        <div className="relative w-full">
            {menuPosition.show && (
                <div
                    className="absolute z-50 flex items-center gap-2 transition-all duration-200 group"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-black transition-all shadow-sm cursor-pointer">
                        <GoPlus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>

                    <button
                        onClick={handleImageUpload}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-green-600 hover:text-white cursor-pointer"
                    >
                        <MdOutlineAddPhotoAlternate size={18} />
                    </button>
                </div>
            )}

            {/* CUSTOM IMAGE BUBBLE MENU - Artık sadece bir tetikleyici */}
            {bubbleMenu.show && !isAltModalOpen && (
                <div
                    className="absolute z-[60] flex items-center gap-1 bg-gray-800 backdrop-blur-md text-white border border-white/10 shadow-2xl rounded-sm py-2 px-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{
                        top: bubbleMenu.top - 5,
                        left: bubbleMenu.left + 50,
                    }} // Görselin ortasına doğru çektik
                >
                    <button
                        onClick={() => openAltModal(editor)}
                        className="w-full h-full flex items-center transition-colors text-xs cursor-pointer"
                    >
                        {editingImageAttrs?.alt ? editingImageAttrs.alt : 'Alt Metin Ekle'}
                    </button>
                    {/* TOOLTIP ARROW */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45 border-r border-b border-white/10 -z-10" />
                </div>
            )}

            {/* --- APPLE STYLE ALT TEXT MODAL --- */}
            {isAltModalOpen && editingImageAttrs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div
                        className="w-full max-w-2xl animate-in zoom-in-95 duration-300"
                        onKeyDown={(e) => e.stopPropagation()} // Editörün tuşları dinlemesini engelle
                    >
                        <div className="flex flex-col items-center text-center gap-6">
                            {/* Bilgi Metni */}
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">Alternatif Açıklama</h3>
                                <p className="text-black">
                                    Görme engelli okuyucular için bu görselin kısa bir açıklamasını yazınız.
                                </p>
                            </div>

                            {/* Ufak Önizleme */}
                            <div className="relative max-w-xs h-64 aspect-video overflow-hidden">
                                <img
                                    src={editingImageAttrs.src}
                                    alt="Önizleme"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Input Alanı */}
                            <div className="w-full flex flex-col gap-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Örn: Yağmurlu bir günde pencere kenarında duran sıcak bir kahve fincanı..."
                                    className="w-full px-4 py-1 border-l border-gray-500 outline-none transition-all text-gray-800 bg-transparent"
                                    value={editingImageAttrs.alt}
                                    onChange={(e) => setEditingImageAttrs({ ...editingImageAttrs, alt: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveAltText(editor, editingImageAttrs.alt);
                                        if (e.key === 'Escape') setIsAltModalOpen(false);
                                    }}
                                />

                                {/* Butonlar */}
                                <div className="w-full flex items-center justify-center gap-3 pt-2 text-xs">
                                    <button
                                        onClick={() => saveAltText(editor, editingImageAttrs.alt)}
                                        className="px-3 py-2 bg-transparent text-green-600 rounded-2xl border border-green-600 cursor-pointer"
                                    >
                                        Kaydet
                                    </button>
                                    <button
                                        onClick={() => setIsAltModalOpen(false)}
                                        className="px-3 py-2 bg-transparent text-gray-500 rounded-2xl border border-gray-500 cursor-pointer transition-colors"
                                    >
                                        Kapat
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <EditorContent editor={editor} />

            {/* Apple Style Floating Toolbar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-4 py-2 flex gap-2">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-full ${editor.isActive('bold') ? 'bg-black text-white' : ''}`}><GoBold /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-full ${editor.isActive('italic') ? 'bg-black text-white' : ''}`}><GoItalic /></button>
                <div className="w-[1px] bg-gray-200 mx-1" />
                <button onClick={handleImageUpload} className="p-2 text-green-600"><MdOutlineAddPhotoAlternate size={20} /></button>
            </div>
        </div>
    );
};
export default TiptapEditor;