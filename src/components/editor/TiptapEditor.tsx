// src/components/editor/TiptapEditor.tsx
"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { GoBold, GoItalic, GoPlus, GoQuote } from "react-icons/go";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useState } from 'react';

interface TiptapEditorProps {
    content?: any;
    onUpdate: (json: any) => void;
}

const TiptapEditor = ({ content, onUpdate }: TiptapEditorProps) => {

    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number, show: boolean }>({ top: 0, left: 0, show: false });

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
        },
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-lg max-w-none focus:outline-none min-h-[500px]',
            },
        },
    });

    // Medium Stili Menü Pozisyonunu Hesapla
    const updateMenuPosition = (editor: any) => {
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
    };

    if (!editor) return null;

    return (
        <div className="relative w-full">
            {/* MEDIUM STYLE CUSTOM FLOATING MENU */}
            {menuPosition.show && (
                <div
                    className="absolute z-50 flex items-center gap-2 transition-all duration-200 group"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-black transition-all shadow-sm">
                        <GoPlus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>

                    <button
                        onClick={() => {
                            const url = window.prompt("Görsel Linki:");
                            if (url) editor.chain().focus().setImage({ src: url }).run();
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-green-600 hover:text-white"
                    >
                        <MdOutlineAddPhotoAlternate size={18} />
                    </button>
                </div>
            )}

            <EditorContent editor={editor} />

            {/* Apple Style Floating Toolbar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-4 py-2 flex gap-2">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-full ${editor.isActive('bold') ? 'bg-black text-white' : ''}`}><GoBold /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-full ${editor.isActive('italic') ? 'bg-black text-white' : ''}`}><GoItalic /></button>
                <div className="w-[1px] bg-gray-200 mx-1" />
                <button onClick={() => {/* Image Upload Gelecek */ }} className="p-2 text-green-600"><MdOutlineAddPhotoAlternate size={20} /></button>
            </div>
        </div>
    );
};
export default TiptapEditor;