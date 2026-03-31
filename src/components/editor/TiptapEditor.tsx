// src/components/editor/TiptapEditor.tsx
"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus'
import Focus from '@tiptap/extension-focus';
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { GoBold, GoCode, GoItalic, GoPencil, GoPlus, GoQuote, GoTrash } from "react-icons/go";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useEffect, useState } from 'react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import sql from 'highlight.js/lib/languages/sql';
const lowlight = createLowlight(common);
lowlight.register('java', java);
lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('ts', javascript);
lowlight.register('css', css);
lowlight.register('python', python);
lowlight.register('csharp', csharp);
lowlight.register('cpp', cpp);
lowlight.register('sql', sql);

interface TiptapEditorProps {
    content?: any;
    onUpdate: (json: any) => void;
}

const TiptapEditor = ({ content, onUpdate }: TiptapEditorProps) => {

    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [editingImageAttrs, setEditingImageAttrs] = useState<{ src: string; alt: string } | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Image.configure({ allowBase64: true }),
            Placeholder.configure({ placeholder: 'Tell your story...' }),
            CodeBlockLowlight.configure({ lowlight }),
            Focus.configure({ className: 'is-focused', mode: 'all' }),
        ],
        autofocus: 'start',
        content: content || '',
        immediatelyRender: false,
        onCreate({ editor }) {
            // Editör yaratıldığı an bir 'focus' emri gönder
            setTimeout(() => {
                editor.commands.focus('start');
            }, 10);
        },
        onUpdate: ({ editor }) => {
            onUpdate(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-lg max-w-none focus:outline-none min-h-[500px]',
            },
            handleDOMEvents: {
                focus: (view) => {
                    view.dom.classList.add('is-focused');
                    return false;
                },
            },
        },
    });

    useEffect(() => {
        if (editor) {
            // 100ms gecikme, DOM'un ve Tippy'nin (FloatingMenu) 
            // tamamen hazır olduğundan emin olmamızı sağlar.
            const timer = setTimeout(() => {
                if (editor.isEmpty) {
                    editor.commands.focus('start');

                    // Burası kilit nokta: Editöre boş bir işlem (transaction) gönderiyoruz.
                    // Bu, FloatingMenu'nün 'shouldShow' kontrolünü yeniden çalıştırır.
                    editor.view.dispatch(editor.state.tr);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [editor]);

    const openAltModal = () => {
        if (!editor) return;
        const attrs = editor.getAttributes('image');
        setEditingImageAttrs({ src: attrs.src, alt: attrs.alt || '' });
        setIsAltModalOpen(true);
    };

    const saveAltText = (newAlt: string) => {
        if (!editor) return;
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
        <div className="relative w-full group/editor playfair-display-400">

            <FloatingMenu
                editor={editor}
                options={{
                    placement: 'left', // Menü konumu
                    offset: { mainAxis: -110, crossAxis: 0 },
                    shift: false,
                    flip: false,
                }}
                shouldShow={({ state }) => {
                    // Sadece boş bir paragrafsa göster
                    const { selection } = state;
                    const { $from } = selection;
                    // 1. Eğer editör odaklanmışsa (isFocused)
                    // 2. Ve bulunulan yer bir paragrafsa
                    // 3. Ve o paragraf boşsa göster
                    const isParagraph = $from.parent.type.name === 'paragraph';
                    const isEmpty = $from.parent.content.size === 0;

                    return (editor.isFocused || editor.isEmpty) && isParagraph && isEmpty;
                }}
            >
                <div className="floating-menu-container flex items-center gap-5 transition-all duration-200 group">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-black transition-all shadow-sm cursor-pointer">
                        <GoPlus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 transition-all duration-200">
                        <button
                            onClick={handleImageUpload}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-green-600 opacity-0 border border-green-300 hover:border-green-500 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                            <MdOutlineAddPhotoAlternate size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 opacity-0 border
                            border-blue-300 hover:border-blue-500 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                            <GoCode size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 border border-gray-300 hover:border-gray-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Ayraç"
                        >
                            <span className="font-bold text-lg leading-none">···</span>
                        </button>
                    </div>
                </div>
            </FloatingMenu>

            {/* Seçili Metin İçin Bubble Menu */}
            <BubbleMenu
                editor={editor}
                options={{
                    placement: 'top', // Menü konumu
                    offset: { mainAxis: 10, crossAxis: 0 },
                    shift: false,
                    flip: false,
                }}
                shouldShow={({ editor, state }) => {
                    const { selection } = state;
                    const { empty } = selection;

                    // 1. Eğer görsel seçiliyse bu menü görünmesin (Görselin kendi menüsü var)
                    if (editor.isActive('image')) return false;

                    // 2. Sadece metin seçiliyse (boş değilse) göster
                    return !empty;
                }}
            >
                <div className="flex items-center gap-1 bg-black/90 backdrop-blur-md text-white border border-white/10 shadow-xl rounded-lg py-1 px-2 animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
                    >
                        <GoBold size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
                    >
                        <GoItalic size={18} />
                    </button>

                    <div className="w-[1px] h-4 bg-white/20 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('code') ? 'text-blue-400' : ''}`}
                    >
                        <GoCode size={18} />
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('blockquote') ? 'text-blue-400' : ''}`}
                    >
                        <GoQuote size={18} />
                    </button>

                    {/* Ok işareti tasarımı */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 rotate-45 -z-10" />
                </div>
            </BubbleMenu>

            {/* Code Block Dil Seçici — değişmedi */}
            {editor.isActive('codeBlock') && (
                <div className="absolute right-2 top-2 z-[60] backdrop-blur-md p-1 flex gap-1">
                    <select
                        className="text-zinc-700 text-[10px] tracking-wider outline-none cursor-pointer"
                        value={editor.getAttributes('codeBlock').language || 'auto'}
                        onChange={(e) => {
                            const val = e.target.value === 'auto' ? null : e.target.value;
                            editor.chain().focus().updateAttributes('codeBlock', { language: val }).run();
                        }}
                    >
                        <option value="auto">Auto</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="sql">SQL</option>
                        <option value="css">CSS</option>
                    </select>
                </div>
            )}

            {/* Alt Text Modal — değişmedi */}
            {isAltModalOpen && editingImageAttrs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div
                        className="w-full max-w-2xl animate-in zoom-in-95 duration-300"
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">Alternatif Açıklama</h3>
                                <p className="text-black">
                                    Görme engelli okuyucular için bu görselin kısa bir açıklamasını yazınız.
                                </p>
                            </div>
                            <div className="relative max-w-xs h-64 aspect-video overflow-hidden">
                                <img
                                    src={editingImageAttrs.src}
                                    alt="Önizleme"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            <div className="w-full flex flex-col gap-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Örn: Yağmurlu bir günde pencere kenarında duran sıcak bir kahve fincanı..."
                                    className="w-full px-4 py-1 border-l border-gray-500 outline-none transition-all text-gray-800 bg-transparent placeholder:italic"
                                    value={editingImageAttrs.alt}
                                    onChange={(e) =>
                                        setEditingImageAttrs({ ...editingImageAttrs, alt: e.target.value })
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveAltText(editingImageAttrs.alt);
                                        if (e.key === 'Escape') setIsAltModalOpen(false);
                                    }}
                                />
                                <div className="w-full flex items-center justify-center gap-3 pt-2 text-xs">
                                    <button
                                        onClick={() => saveAltText(editingImageAttrs.alt)}
                                        className="px-3 py-2 bg-transparent text-green-600 rounded-2xl border border-green-600 cursor-pointer"
                                    >
                                        Kaydet
                                    </button>
                                    <button
                                        onClick={() => setIsAltModalOpen(false)}
                                        className="px-3 py-2 bg-transparent text-gray-500 rounded-2xl border border-gray-500 cursor-pointer"
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
        </div>
    );


};
export default TiptapEditor;