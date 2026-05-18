"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus'
import Focus from '@tiptap/extension-focus';
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { GoBold, GoCode, GoItalic, GoPlus, GoQuote } from "react-icons/go";
import { HiOutlineSparkles } from "react-icons/hi2";
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
import { uploadImageToBackend } from '@/utils/UploadImageToBackend';

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
    postId: number | null; // Artık dışarıdan o anki postun id'sini alıyoruz
}

const TiptapEditor = ({ content, onUpdate, postId }: TiptapEditorProps) => {

    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [editingImageAttrs, setEditingImageAttrs] = useState<{ src: string; alt: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Image.configure({ inline: true, allowBase64: false }), // 🔥 Base64 engeli tam gaz aktif
            Placeholder.configure({ placeholder: 'Hikayeni sahnele...' }),
            CodeBlockLowlight.configure({ lowlight }),
            Focus.configure({ className: 'is-focused', mode: 'all' }),
        ],
        autofocus: 'start',
        content: content || '',
        immediatelyRender: false,
        onCreate({ editor }) {
            setTimeout(() => {
                editor.commands.focus('start');
            }, 10);
        },
        onUpdate: ({ editor }) => {
            onUpdate(editor.getJSON());
        },
        editorProps: {
            handleDrop: function (view, event, slice, moved) {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];

                    if (/image\//.test(file.type)) {
                        // Eğer henüz post oluşturulmadıysa resmi yükletme, uyar
                        if (!postId) {
                            alert("Resim eklemeden önce lütfen şık bir başlık yazıp taslak oluşturulmasını bekleyin.");
                            return true;
                        }

                        uploadImageToBackend(file, postId).then((url) => {
                            if (url) {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                            }
                        });
                        return true; 
                    }
                }
                return false;
            },
            handlePaste: function (view, event, slice) {
                const items = event.clipboardData?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") === 0) {
                            const file = items[i].getAsFile();
                            if (file) {
                                if (!postId) {
                                    alert("Resim yapıştırmadan önce lütfen bir başlık yazın.");
                                    return true;
                                }
                                uploadImageToBackend(file, postId).then((url) => {
                                    if (url) {
                                        const { schema } = view.state;
                                        const node = schema.nodes.image.create({ src: url });
                                        const transaction = view.state.tr.replaceSelectionWith(node);
                                        view.dispatch(transaction);
                                    }
                                });
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
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
            const timer = setTimeout(() => {
                editor.commands.focus('start');
                editor.view.dispatch(editor.state.tr);
            }, 200);

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

    // ARTIK BUTONLA DOSYA SEÇİLDİĞİNDE DE BASE64 DEĞİL, BACKEND'E MULTIPART ATILIYOR!
    const handleImageUpload = () => {
        if (!postId) {
            alert("Görsel yüklemeden önce lütfen bir başlık yazın ve taslağın oluşmasını bekleyin.");
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                
                // Doğrudan bizim zırhlı servisimize fırlatıyoruz
                const uploadedUrl = await uploadImageToBackend(file, postId);
                if (uploadedUrl) {
                    editor?.chain().focus().setImage({ src: uploadedUrl }).run();
                } else {
                    alert("Görsel yüklenirken bir hata oluştu.");
                }
            }
        };
        input.click();
    };

    const handleAISpark = async () => {
        if (!editor || isAiLoading) return;
        const context = editor.getText().slice(-1000);
        if (!context.trim()) return;

        setIsAiLoading(true);
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context }),
            });
            const data = await response.json();
            if (data.text) {
                editor.chain().focus().insertContent(data.text).run();
            }
        } catch (error) {
            console.error("AI Spark hatası:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    if (!editor) return null;

    return (
        <div className="relative w-full group/editor playfair-display-400">
            {/* FLOATING, BUBBLE MENULERİN VE DİĞER JSX BİLEŞENLERİN TAMAMI DEĞİŞMEDEN AYNEN KALIYOR */}
            <FloatingMenu
                editor={editor}
                options={{
                    placement: 'left',
                    offset: { mainAxis: -110, crossAxis: 0 },
                    shift: false,
                    flip: false,
                }}
                shouldShow={({ state }) => {
                    const { selection } = state;
                    const { $from } = selection;
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
                            className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 opacity-0 border border-blue-300 hover:border-blue-500 group-hover:opacity-100 transition-all cursor-pointer"
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

            <BubbleMenu
                editor={editor}
                pluginKey="aiSparkMenu"
                shouldShow={({ state }) => {
                    const { selection } = state;
                    const { $from, empty } = selection;
                    const isParagraph = $from.parent.type.name === 'paragraph';
                    const hasContent = $from.parent.content.size > 0;
                    return empty && isParagraph && hasContent;
                }}
                options={{
                    placement: 'right',
                    offset: { mainAxis: 20, crossAxis: 0 },
                }}
            >
                <button
                    onClick={handleAISpark}
                    disabled={isAiLoading}
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shadow-sm cursor-pointer border ${isAiLoading ? 'border-purple-300 animate-pulse' : 'border-purple-300 text-purple-600 scale-90 hover:scale-100'}`}
                >
                    {isAiLoading ? (
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <HiOutlineSparkles size={20} />
                    )}
                </button>
            </BubbleMenu>

            <BubbleMenu
                editor={editor}
                options={{
                    placement: 'top',
                    offset: { mainAxis: 10, crossAxis: 0 },
                    shift: false,
                    flip: false,
                }}
                shouldShow={({ editor, state }) => {
                    const { selection } = state;
                    return !selection.empty && !editor.isActive('image') && !editor.isActive('horizontalRule');
                }}
            >
                <div className="flex items-center gap-1 bg-black/90 backdrop-blur-md text-white border border-white/10 shadow-xl rounded-lg py-1 px-2 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-blue-400' : ''}`}><GoBold size={18} /></button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-blue-400' : ''}`}><GoItalic size={18} /></button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('code') ? 'text-blue-400' : ''}`}><GoCode size={18} /></button>
                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('blockquote') ? 'text-blue-400' : ''}`}><GoQuote size={18} /></button>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 rotate-45 -z-10" />
                </div>
            </BubbleMenu>

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

            {isAltModalOpen && editingImageAttrs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 backdrop-blur-md">
                    <div className="w-full max-w-2xl text-center flex flex-col items-center gap-6">
                        <h3 className="text-2xl font-bold">Alternatif Açıklama</h3>
                        <img src={editingImageAttrs.src} alt="Önizleme" className="max-w-xs h-64 object-cover rounded-md" />
                        <input
                            autoFocus
                            type="text"
                            className="w-full px-4 py-1 border-l border-gray-500 outline-none bg-transparent"
                            value={editingImageAttrs.alt}
                            onChange={(e) => setEditingImageAttrs({ ...editingImageAttrs, alt: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveAltText(editingImageAttrs.alt); }}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => saveAltText(editingImageAttrs.alt)} className="px-3 py-2 text-green-600 border border-green-600 rounded-2xl">Kaydet</button>
                            <button onClick={() => setIsAltModalOpen(false)} className="px-3 py-2 text-gray-500 border border-gray-500 rounded-2xl">Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
};
export default TiptapEditor;