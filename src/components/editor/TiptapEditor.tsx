"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import Focus from '@tiptap/extension-focus';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { GoBold, GoCode, GoItalic, GoPlus, GoQuote } from "react-icons/go";
import { MdOutlineAddPhotoAlternate, MdOutlineAspectRatio } from "react-icons/md";
import { useEffect, useState, useRef } from 'react';
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

// 🔥 MİMARİ ADIM: Altyazıyı Image Node'unun İçine (Figure/Figcaption) Gömerek Genişletilmiş Image Tanımı
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => {
                    if (!attributes.width) return { style: 'width: 100%' };
                    return { style: `width: ${attributes.width};` };
                },
            },
            height: {
                default: 'auto',
                renderHTML: attributes => {
                    if (!attributes.height) return { style: 'height: auto' };
                    return { style: `height: ${attributes.height};` };
                },
            },
            aspectRatio: {
                default: null,
                renderHTML: () => ({}), // Html'e yazılması gerekmez, sadece iç mantık için kullanacağız
            }

        };
    },
    // Editörün HTML'i render etme mantığını tamamen eziyoruz
    renderHTML({ HTMLAttributes }) {
        const { alt, width, height, ...restAttributes } = HTMLAttributes;

        return [
            'figure',
            {
                class: 'custom-tiptap-figure mx-auto my-6 block transition-all duration-300',
                style: `width: ${width || '100%'};`
            },
            [
                'img',
                {
                    ...restAttributes,
                    alt,
                    class: 'w-full h-auto max-h-[600px] object-cover rounded-xl border border-gray-100 shadow-sm'
                }
            ],
            // Eğer alt metni (altyazı) varsa figure içinde figcaption olarak basıyoruz
            alt ? ['figcaption', { class: 'text-center text-xs text-gray-400 italic mt-2 font-sans select-none' }, alt] : ['span']
        ];
    },
});

interface TiptapEditorProps {
    content?: any;
    onUpdate: (json: any) => void;
    postId: number | null;
}

const TiptapEditor = ({ content, onUpdate, postId }: TiptapEditorProps) => {

    const postIdRef = useRef<number | null>(postId);
    useEffect(() => {
        postIdRef.current = postId;
    }, [postId]);

    const onUpdateRef = useRef(onUpdate);
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [editingImageAttrs, setEditingImageAttrs] = useState<{ src: string; alt: string } | null>(null);

    const isContentInitialized = useRef(false);

    const extractUrl = (backendResult: any): string => {
        if (!backendResult) return "";
        let url = "";
        if (typeof backendResult === 'string') url = backendResult;
        else if (backendResult.url) url = backendResult.url;
        else if (backendResult.data?.url) url = backendResult.data.url;

        if (url && url.startsWith('/')) {
            url = `http://localhost:8080${url}`;
        }
        return url;
    };

    const getImageRatio = (src: string): Promise<number> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
            img.onerror = () => resolve(1); // hata olursa 1 (kare kabul et)
            img.src = src;
        });
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            CustomImage.configure({
                inline: false,
                allowBase64: true,
                // Sınıfları renderHTML içinde özelleştirdiğimiz için burayı sade bırakıyoruz
            }),
            Placeholder.configure({ placeholder: 'Hikayeni sahnele...' }),
            CodeBlockLowlight.configure({ lowlight }),
            // Focus class'ı artık img yerine direkt dışarıdaki figure elementine vuracak
            Focus.configure({ className: 'is-focused ring-2 ring-blue-500/30 bg-blue-50/10 p-2 rounded-xl transition-all', mode: 'all' }),
        ],
        autofocus: false,
        content: content || '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdateRef.current(editor.getJSON());
        },
        editorProps: {
            handleDrop: function (view, event, slice, moved) {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];

                    if (/image\//.test(file.type)) {
                        if (!postIdRef.current) {
                            alert("Resim eklemeden önce lütfen şık bir başlık yazıp taslak oluşturulmasını bekleyin.");
                            return true;
                        }

                        const localBlobUrl = URL.createObjectURL(file);

                        // 🔥 Önce placeholder olarak ekle, ratio hesaplanınca güncelle
                        view.dispatch(view.state.tr.replaceSelectionWith(
                            view.state.schema.nodes.image.create({
                                src: localBlobUrl, width: '100%', height: 'auto', aspectRatio: null
                            })
                        ));
                        Promise.all([
                            getImageRatio(localBlobUrl),
                            uploadImageToBackend(file, postIdRef.current)
                        ]).then(([ratio, res]) => {
                            const finalUrl = extractUrl(res);
                            const { state } = view;
                            const tr = state.tr;
                            let changed = false;
                            state.doc.descendants((node, pos) => {
                                if (node.type.name === 'image' && node.attrs.src === localBlobUrl) {
                                    if (finalUrl) tr.setNodeAttribute(pos, 'src', finalUrl);
                                    tr.setNodeAttribute(pos, 'aspectRatio', ratio); // 👈
                                    changed = true;
                                }
                                return true;
                            });
                            if (changed) {
                                view.dispatch(tr);
                                onUpdateRef.current(view.state.doc.toJSON());
                            }
                        }).catch(err => console.error("Drop hatası:", err));
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
                                if (!postIdRef.current) {
                                    alert("Resim yapıştırmadan önce lütfen bir başlık yazın.");
                                    return true;
                                }

                                const localBlobUrl = URL.createObjectURL(file);


                                view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: localBlobUrl, width: '100%', height: 'auto', aspectRatio: null })));

                                Promise.all([
                                    getImageRatio(localBlobUrl),
                                    uploadImageToBackend(file, postIdRef.current)
                                ]).then(([ratio, res]) => {
                                    const finalUrl = extractUrl(res);
                                    if (finalUrl) {
                                        const { state } = view;
                                        const tr = state.tr;
                                        let changed = false;
                                        state.doc.descendants((node, pos) => {
                                            if (node.type.name === 'image' && node.attrs.src === localBlobUrl) {
                                                tr.setNodeAttribute(pos, 'src', finalUrl);
                                                changed = true;
                                                tr.setNodeAttribute(pos, 'aspectRatio', ratio); // 👈 Yapıştırılan görselin oranını da güncelle
                                            }
                                            return true;
                                        });
                                        if (changed) {
                                            view.dispatch(tr);
                                            onUpdateRef.current(view.state.doc.toJSON());
                                        }
                                    }
                                }).catch(err => console.error("Görsel yapıştırma backend hatası:", err));
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
        },
    });

    useEffect(() => {
        if (editor && content && !isContentInitialized.current) {
            editor.commands.setContent(content);
            isContentInitialized.current = true;

            setTimeout(() => {
                editor.commands.focus('start');
            }, 200);
        }
    }, [editor, content]);

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

    // 🔥 YENİ: Görsel boyutunu güncelleyen yardımcı fonksiyon
    const setImageSize = (sizePercentage: string) => {
        if (!editor) return;
        editor.chain().focus().updateAttributes('image', { width: sizePercentage, height: 'auto' }).run();
    };


    const handleImageUpload = () => {
        if (!postIdRef.current) {
            alert("Görsel yüklemeden önce lütfen bir başlık yazın ve taslağın oluşmasını bekleyin.");
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            if (!input.files?.length || !editor) return;

            const file = input.files[0];
            const localBlobUrl = URL.createObjectURL(file);

            const ratio = await getImageRatio(localBlobUrl);

            editor.view.dispatch(
                editor.view.state.tr.replaceSelectionWith(
                    editor.view.state.schema.nodes.image.create({ src: localBlobUrl, width: '100%', height: 'auto', aspectRatio: ratio })
                )
            );

            try {
                const uploadResult = await uploadImageToBackend(file, postIdRef.current!);
                const finalUrl = extractUrl(uploadResult);

                if (!finalUrl) {
                    alert("Görsel yüklenirken bir hata oluştu veya geçersiz URL döndü.");
                    return;
                }

                const currentState = editor.view.state;
                const tr = currentState.tr;
                let changed = false;

                currentState.doc.descendants((node, pos) => {
                    if (node.type.name === 'image' && node.attrs.src === localBlobUrl) {
                        tr.setNodeAttribute(pos, 'src', finalUrl);
                        changed = true;
                    }
                    return true;
                });

                if (changed) {
                    editor.view.dispatch(tr);
                    onUpdateRef.current(editor.view.state.doc.toJSON());
                }

            } catch (err) {
                console.error("Görsel seçim yükleme hatası:", err);
            }
        };
        input.click();
    };

    if (!editor) return null;

    // Şu an seçili olan resmin genişlik değerini BubbleMenu'de "aktif" göstermek için alıyoruz
    const currentWidth = editor.getAttributes('image').width || '100%';

    const aspectRatio = editor.getAttributes('image').aspectRatio;
    const ratioKnown = aspectRatio !== null && aspectRatio !== undefined;

    const canBeFull = ratioKnown ? aspectRatio >= 1.2 : true;      // bilindiği gibi genişse tam genişlik opsiyonu sun, oran bilinmiyorsa varsayılan olarak sun (kullanıcı deneyimi için)
    const canBeMedium = ratioKnown ? aspectRatio >= 0.85 : true;   // bilindiği gibi çok kare değilse orta boyut opsiyonu sun, oran bilinmiyorsa varsayılan olarak sun (kullanıcı deneyimi için)


    return (
        <div className="relative w-full group/editor playfair-display-400">
            {/* Canlı Altyazı (Caption) için Global CSS Injection */}
            <style jsx global>{`
                .tiptap img + ::after {
                     display: none !important; /* Tiptap default glitch'leri önleme */
                }
                /* Editör içinde resmin arkasından gelen bir alt bilgi div'i simülasyonu */
                .image-caption-preview {
                    text-align: center;
                    font-size: 13px;
                    color: #9ca3af;
                    font-style: italic;
                    margin-top: -18px;
                    margin-bottom: 24px;
                    font-family: sans-serif;
                }
            `}</style>

            <FloatingMenu
                editor={editor}
                options={{ placement: 'left', offset: { mainAxis: -110, crossAxis: 0 }, shift: false, flip: false }}
                shouldShow={({ state }) => {
                    const { selection } = state;
                    const { $from } = selection;
                    return (editor.isFocused || editor.isEmpty) && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0;
                }}
            >
                <div className="floating-menu-container flex items-center gap-5 transition-all duration-200 group">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-black transition-all shadow-sm cursor-pointer">
                        <GoPlus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 transition-all duration-200">
                        <button onClick={handleImageUpload} className="flex items-center justify-center w-8 h-8 rounded-full text-green-600 opacity-0 border border-green-300 hover:border-green-500 group-hover:opacity-100 transition-all cursor-pointer">
                            <MdOutlineAddPhotoAlternate size={18} />
                        </button>
                        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 opacity-0 border border-blue-300 hover:border-blue-500 group-hover:opacity-100 transition-all cursor-pointer">
                            <GoCode size={18} />
                        </button>
                        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 border border-gray-300 hover:border-gray-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                            <span className="font-bold text-lg leading-none">···</span>
                        </button>
                    </div>
                </div>
            </FloatingMenu>

            {/* 🔥 YENİLENEN BUBBLE MENU: Boyut Seçenekleri ve Alt Metin Butonu */}
            <BubbleMenu editor={editor} pluginKey="imageFeaturesMenu" shouldShow={({ editor }) => editor.isActive('image')} options={{ placement: 'top', offset: { mainAxis: 12, crossAxis: 0 } }}>
                <div className="flex items-center gap-1.5 bg-black text-white border border-white/10 shadow-xl rounded-xl py-1.5 px-2 text-xs font-sans select-none">
                    <button type="button" onClick={openAltModal} className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/10 rounded-lg transition-all text-blue-400 font-medium border-r border-white/10 pr-3">
                        <span>Alt Yazı Değiştir</span>
                    </button>

                    {/* Üç Boyut Seçeneği */}
                    <div className="flex items-center gap-1 pl-1">
                        <button
                            type="button"
                            onClick={() => setImageSize('50%')}
                            className={`px-2 py-1 rounded-md transition-all ${currentWidth === '50%' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-white/10 text-gray-300'}`}
                        >
                            Small
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageSize('75%')}
                            disabled={!canBeMedium}
                            className={`px-2 py-1 rounded-md transition-all 
                                ${!canBeMedium ? 'opacity-30 cursor-not-allowed' : ''}
                                ${currentWidth === '75%' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-white/10 text-gray-300'}`}
                        >
                            Medium
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageSize('100%')}
                            disabled={!canBeFull}
                            className={`px-2 py-1 rounded-md transition-all
                                ${!canBeFull ? 'opacity-30 cursor-not-allowed' : ''}
                                ${currentWidth === '100%' || currentWidth === null ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-white/10 text-gray-300'}`}
                        >
                            Full
                        </button>
                    </div>
                </div>
            </BubbleMenu>

            <BubbleMenu editor={editor} pluginKey="textFormattingMenu" options={{ placement: 'top', offset: { mainAxis: 10, crossAxis: 0 } }} shouldShow={({ editor, state }) => !state.selection.empty && !editor.isActive('image') && !editor.isActive('horizontalRule')}>
                <div className="flex items-center gap-1 bg-black/90 backdrop-blur-md text-white border border-white/10 shadow-xl rounded-lg py-1 px-2">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-blue-400' : ''}`}><GoBold size={18} /></button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-blue-400' : ''}`}><GoItalic size={18} /></button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('code') ? 'text-blue-400' : ''}`}><GoCode size={18} /></button>
                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-white/10 ${editor.isActive('blockquote') ? 'text-blue-400' : ''}`}><GoQuote size={18} /></button>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 backdrop-blur-md font-sans">
                    <div className="w-full max-w-2xl text-center flex flex-col items-center gap-6">
                        <h3 className="text-2xl font-bold">Resim Alt Yazısı / Açıklaması</h3>
                        <img src={editingImageAttrs.src} alt="Önizleme" className="max-w-xs h-64 object-cover rounded-md shadow-lg" style={{ width: currentWidth }} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Görselin altına şık bir açıklama yazın..."
                            className="w-full px-4 py-2 border-b border-gray-400 outline-none bg-transparent text-center text-lg"
                            value={editingImageAttrs.alt}
                            onChange={(e) => setEditingImageAttrs({ ...editingImageAttrs, alt: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveAltText(editingImageAttrs.alt); }}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => saveAltText(editingImageAttrs.alt)} className="px-5 py-2 text-green-600 border border-green-600 rounded-full hover:bg-green-50 transition-all cursor-pointer">Kaydet</button>
                            <button onClick={() => setIsAltModalOpen(false)} className="px-5 py-2 text-gray-500 border border-gray-500 rounded-full hover:bg-gray-50 transition-all cursor-pointer">Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            <EditorContent editor={editor} />

            {/* 🔥 YENİ: Editör içinde canlı altyazı önizlemesi */}
            {editor.isActive('image') && editor.getAttributes('image').alt && (
                <div className="image-caption-preview" style={{ width: currentWidth, marginLeft: 'auto', marginRight: 'auto' }}>
                    {editor.getAttributes('image').alt}
                </div>
            )}
        </div>
    );
};
export default TiptapEditor;