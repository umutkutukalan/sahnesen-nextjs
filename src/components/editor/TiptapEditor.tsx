"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import Focus from "@tiptap/extension-focus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { GoCode, GoPlus } from "react-icons/go";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useEffect, useState, useRef } from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import csharp from "highlight.js/lib/languages/csharp";
import cpp from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";
import { uploadImageToBackend } from "@/utils/UploadImageToBackend";
import Link from "@tiptap/extension-link";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";

const lowlight = createLowlight(common);
lowlight.register("java", java);
lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("ts", javascript);
lowlight.register("css", css);
lowlight.register("python", python);
lowlight.register("csharp", csharp);
lowlight.register("cpp", cpp);
lowlight.register("sql", sql);

import { Node } from "@tiptap/core";

// 🔥 MİMARİ ADIM: Paragrafı genişleterek içeriğine göre sınıf kazandırıyoruz
const CustomParagraph = Paragraph.extend({
  renderHTML({ node, HTMLAttributes }) {
    const firstChild = node.firstChild;
    const isDropcap = firstChild && firstChild.type.name === "dropcap";
    const hasText = node.textContent.length > (isDropcap ? 1 : 0);

    const extraClass = isDropcap && !hasText ? "empty-dropcap" : "";

    const mergedAttributes = {
      ...HTMLAttributes,
      class: [HTMLAttributes.class, extraClass].filter(Boolean).join(" "),
    };

    return ["p", mergedAttributes, 0];
  },
});

// 🔥 MİMARİ ADIM: Dropcap Inline Atom Node Tanımı
const Dropcap = Node.create({
  name: "dropcap",
  group: "inline",
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,

  addAttributes() {
    return {
      letter: {
        default: "A",
        parseHTML: (element) => element.textContent || "A",
        renderHTML: (attributes) => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="dropcap"]',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "span",
      {
        "data-type": "dropcap",
        class: "dropcap-letter",
        contenteditable: "false",
      },
      node.attrs.letter,
    ];
  },
});

// 🔥 MİMARİ ADIM: Sadece Temiz Veri Tutan ve Sınıf Hesaplamasını renderHTML'e Bırakan Genişletilmiş Image Tanımı
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "50%", // Başlangıçta Small (%50) başlasın
        parseHTML: (element) => element.getAttribute("data-width") || "50%",
        renderHTML: (attributes) => ({
          "data-width": attributes.width || "50%",
        }), // Inline style yok!
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => ({
          "data-height": attributes.height || "auto",
        }),
      },
      aspectRatio: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-aspect-ratio"),
        renderHTML: (attributes) => {
          if (!attributes.aspectRatio) return {};
          return { "data-aspect-ratio": attributes.aspectRatio.toString() };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const figure = document.createElement("figure");
      const div = document.createElement("div");
      const img = document.createElement("img");
      const figcaption = document.createElement("figcaption");

      // Toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "image-toolbar";
      toolbar.innerHTML = `
                <div class="flex items-center gap-3 size-buttons"></div>
                <div class="w-px h-4 mx-1" style="background: rgba(255,255,255,0.2)"></div>
                <button class="image-toolbar-btn image-toolbar-alt-btn">Alt Yazı</button>
                 <div style="
                    position: absolute;
                    bottom: -7px;
                    left: 55%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 7px solid transparent;
                    border-right: 7px solid transparent;
                    border-top: 7px solid #1a1a1a;
                "></div>
`;

      toolbar.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const sizeBtn = (e.target as HTMLElement).closest("[data-size]");
        if (sizeBtn) {
          const size = sizeBtn.getAttribute("data-size");
          const pos = typeof getPos === "function" ? getPos() : null;
          if (pos !== null && size) {
            editor
              .chain()
              .setNodeSelection(pos)
              .updateAttributes("image", { width: size })
              .run();
          }
          return;
        }

        const altBtn = (e.target as HTMLElement).closest(
          ".image-toolbar-alt-btn",
        );
        if (altBtn) {
          // editor'daki openAltModal'ı tetikle
          // Bunun için editor üzerinden custom event fırlatabilirsin:
          const pos = typeof getPos === "function" ? getPos() : null;
          if (pos !== null) {
            editor.chain().setNodeSelection(pos).run();
          }
          editor.emit("openAltModal" as any);
          return;
        }
      });

      div.className = "h-full";
      figcaption.className =
        "text-xs text-center italic text-gray-400 px-4 mt-3 font-sans block w-full select-none";

      figure.appendChild(toolbar);
      figure.appendChild(div);
      div.appendChild(img);
      figure.appendChild(figcaption);

      // Önceki state'i tut — sadece değişirse DOM'a dokun
      let prevWidth: string | null = null;
      let prevSrc: string | null = null;
      let prevAlt: string | null = null;

      const update = (node: any) => {
        const width = node.attrs.width || "50%";
        const src = node.attrs.src || "";
        const alt = node.attrs.alt || "";

        // AspectRatio hesabı
        const rawRatio = node.attrs.aspectRatio;
        const aspectRatio =
          rawRatio !== null && rawRatio !== undefined && rawRatio !== ""
            ? parseFloat(rawRatio)
            : null;
        const ratioKnown =
          aspectRatio !== null && !isNaN(aspectRatio) && aspectRatio !== 0;
        const canBeMedium = ratioKnown ? aspectRatio >= 0.85 : true;
        const canBeFull = ratioKnown ? aspectRatio >= 1.2 : true;

        // Size butonlarını her seferinde sıfırdan oluştur
        const sizeContainer = toolbar.querySelector(
          ".size-buttons",
        ) as HTMLElement;
        sizeContainer.innerHTML = "";

        const sizes = [
          { value: "50%", label: "Small", show: true },
          { value: "75%", label: "Medium", show: canBeMedium },
          { value: "100%", label: "Full", show: canBeFull },
        ];

        sizes.forEach(({ value, label, show }) => {
          if (!show) return;
          const btn = document.createElement("button");
          btn.setAttribute("data-size", value);
          btn.className = `image-toolbar-btn ${width === value ? "active" : ""}`;
          btn.textContent = label;
          sizeContainer.appendChild(btn);
        });

        // div width güncelle
        if (width !== prevWidth) {
          div.classList.remove(
            "w-screen",
            "w-[120%]",
            "w-full",
            "relative",
            "left-1/2",
            "-translate-x-1/2",
          );
          div.style.cssText = "";

          if (width === "100%") {
            div.style.width = "100vw";
            div.style.position = "relative";
            div.classList.add("left-1/2", "-translate-x-1/2");
          } else if (width === "75%") {
            div.classList.add(
              "w-[120%]",
              "relative",
              "left-1/2",
              "-translate-x-1/2",
            );
          } else {
            div.classList.add("w-full");
          }

          prevWidth = width;
        }

        if (src !== prevSrc) {
          img.src = src;
          prevSrc = src;
        }

        if (alt !== prevAlt) {
          img.alt = alt;
          figcaption.textContent = alt;
          figcaption.style.display = alt ? "" : "none";
          prevAlt = alt;
        }
      };

      update(node);

      return {
        dom: figure,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          update(updatedNode);
          return true;
        },
      };
    };
  },
});

const toggleParagraphDropcap = (editor: any) => {
  if (!editor) return;
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  // Paragrafta olup olmadığımızı kontrol et
  if ($from.parent.type.name !== "paragraph") return;

  const paragraphStart = $from.start();
  const firstChild = $from.parent.firstChild;
  const hasDropcap = firstChild && firstChild.type.name === "dropcap";

  editor.commands.focus();

  if (hasDropcap) {
    // Dropcap'i kaldır ve harfi normal metin olarak geri ekle
    const letter = firstChild.attrs.letter || "";
    editor
      .chain()
      .deleteRange({ from: paragraphStart, to: paragraphStart + 1 })
      .insertContentAt(paragraphStart, letter)
      .run();
  } else {
    // İlk harfi bul ve dropcap yap
    const textContent = $from.parent.textContent;
    if (!textContent) return;

    const firstChar = textContent.charAt(0);
    editor
      .chain()
      .deleteRange({ from: paragraphStart, to: paragraphStart + 1 })
      .insertContentAt(paragraphStart, {
        type: "dropcap",
        attrs: { letter: firstChar },
      })
      .run();
  }
};

// Component'in üst seviyesine, toggleParagraphDropcap'in yanına ekle:
const isDropcapEligible = (editor: any): boolean => {
  if (editor.isActive("heading") || editor.isActive("blockquote")) {
    return false;
  }
  if (!editor.isActive("paragraph")) return false;

  try {
    const { $from } = editor.state.selection;
    const domNode = editor.view.nodeDOM($from.before()) as HTMLElement | null;

    if (domNode && domNode.nodeType === Node.ELEMENT_NODE) {
      const computedStyle = window.getComputedStyle(domNode);
      const lineH = parseFloat(computedStyle.lineHeight) || 24;
      return domNode.clientHeight >= lineH * 2;
    }

    return ($from.parent.textContent?.length ?? 0) >= 70;
  } catch (err) {
    console.warn("Dropcap görünüm hesabı esnasında hata:", err);
    const { $from } = editor.state.selection;
    return ($from.parent?.textContent?.length ?? 0) >= 70;
  }
};

interface TiptapEditorProps {
  content?: any;
  onUpdate: (json: any) => void;
  postId: number | null;
}

const TiptapEditor = ({ content, onUpdate, postId }: TiptapEditorProps) => {
  const bubbleToolbarRef = useRef<HTMLDivElement | null>(null);
  const linkInputRef = useRef<HTMLDivElement | null>(null);

  const postIdRef = useRef<number | null>(postId);
  useEffect(() => {
    postIdRef.current = postId;
  }, [postId]);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const [isAltModalOpen, setIsAltModalOpen] = useState(false);
  const [editingImageAttrs, setEditingImageAttrs] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const isContentInitialized = useRef(false);

  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const extractUrl = (backendResult: any): string => {
    if (!backendResult) return "";
    let url = "";
    if (typeof backendResult === "string") url = backendResult;
    else if (backendResult.url) url = backendResult.url;
    else if (backendResult.data?.url) url = backendResult.data.url;

    if (url && url.startsWith("/")) {
      url = `http://localhost:8080${url}`;
    }
    return url;
  };

  const getImageRatio = (src: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
      img.onerror = () => resolve(1);
      img.src = src;
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, paragraph: false }),
      CustomParagraph,
      Dropcap,
      CustomImage.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false, // Tüm boş bloklarda placeholder göster
        showOnlyWhenEditable: true, // Sadece editör düzenleme modundayken (yazarken) çalışsın
        placeholder: ({ node, editor }) => {
          if (node.type.name === "heading" && node.attrs.level === 1) {
            return "Title";
          } else if (node.type.name === "paragraph") {
            // Editörün hafızasındaki dökümanın 2. elementi (index 1) şu anki node ile aynı mı?
            if (
              editor.state.doc.firstChild === node ||
              editor.state.doc.child(1) === node
            ) {
              return "Tell your story...";
            }
          }
          return "";
        },
      }),
      CodeBlockLowlight.extend({
        addKeyboardShortcuts() {
          return {
            "Mod-Alt-c": () => {
              if (this.editor.isActive("blockquote")) {
                return this.editor
                  .chain()
                  .focus()
                  .clearNodes()
                  .toggleCodeBlock()
                  .run();
              }
              return this.editor.chain().focus().toggleCodeBlock().run();
            },
          };
        },
      }).configure({ lowlight }),
      Focus.configure({ className: "is-focused transition-all", mode: "all" }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Heading.extend({
        // KISAYOLLARI YENİDEN TANIMLAYIP AKIŞA BAĞLIYORUZ
        addKeyboardShortcuts() {
          return {
            // Blockquote
            "Mod-Shift-9": () => {
              // Adım 1: Önce blockquote durumunu MEVCUT state'den ölç
              const initialState = this.editor.state;
              const { from, to } = initialState.selection;

              let totalBlocks = 0;
              let quoteBlocks = 0;

              initialState.doc.nodesBetween(from, to, (node) => {
                if (node.isBlock && node.type.name !== "doc") {
                  totalBlocks++;
                  if (node.type.name === "blockquote") quoteBlocks++;
                  return false;
                }
              });

              const allSelectedAreQuote =
                totalBlocks > 0 && quoteBlocks === totalBlocks;

              // Adım 2: Hepsi blockquote ise direkt çık
              if (allSelectedAreQuote) {
                return this.editor.chain().focus().lift("blockquote").run();
              }

              // Adım 3: Heading, dropcap vs. hepsini temizle
              this.editor.chain().focus().clearNodes().run();

              // Adım 4: clearNodes sonrası TAZE state'den dropcap tara
              const afterClearState = this.editor.state;
              const freshFrom = afterClearState.selection.from;
              const freshTo = afterClearState.selection.to;

              afterClearState.doc.nodesBetween(
                freshFrom,
                freshTo,
                (node, pos) => {
                  if (
                    node.type.name === "paragraph" &&
                    node.firstChild?.type.name === "dropcap"
                  ) {
                    const letter = node.firstChild.attrs.letter || "";
                    const paragraphStart = pos + 1;
                    this.editor
                      .chain()
                      .deleteRange({
                        from: paragraphStart,
                        to: paragraphStart + 1,
                      })
                      .insertContentAt(paragraphStart, letter)
                      .run();
                  }
                  return true;
                },
              );

              // Adım 5: Artık temiz paragrafları blockquote'a sarmala
              return this.editor.chain().focus().wrapIn("blockquote").run();
            },

            // Cmd+Alt+1 veya Ctrl+Alt+1 basıldığında:
            "Mod-Alt-1": () => {
              if (this.editor.isActive("heading", { level: 1 })) {
                return this.editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: 1 })
                  .run();
              }

              // Önce blockquote ve diğer tüm yapısal sarmalları temizle
              this.editor.chain().focus().clearNodes().run();

              // Özel H1/H2 mantığını buraya da kuruyoruz
              const hasH1 = this.editor
                .getJSON()
                .content?.some(
                  (n: any) => n.type === "heading" && n.attrs?.level === 1,
                );

              const { state } = this.editor;
              const { $from } = state.selection;

              // Eğer paragrafın başında dropcap varsa, önce onu normal harfe çevir
              if (
                $from.parent.type.name === "paragraph" &&
                $from.parent.firstChild?.type.name === "dropcap"
              ) {
                toggleParagraphDropcap(this.editor); // dropcap'i kaldırıp harfi metne geri koyar
              }

              if (hasH1) {
                return this.editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: 2 })
                  .run();
              }
              return this.editor
                .chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run();
            },

            // Cmd+Alt+2 veya Ctrl+Alt+2 basıldığında:
            "Mod-Alt-2": () => {
              if (this.editor.isActive("heading", { level: 2 })) {
                return this.editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: 2 })
                  .run();
              }

              const { state } = this.editor;
              const { $from } = state.selection;

              // Eğer paragrafın başında dropcap varsa, önce onu normal harfe çevir
              if (
                $from.parent.type.name === "paragraph" &&
                $from.parent.firstChild?.type.name === "dropcap"
              ) {
                toggleParagraphDropcap(this.editor); // dropcap'i kaldırıp harfi metne geri koyar
              }

              return this.editor
                .chain()
                .focus()
                .clearNodes()
                .toggleHeading({ level: 2 })
                .run();
            },

            // Cmd+Alt+3 veya Ctrl+Alt+3 basıldığında:
            "Mod-Alt-3": () => {
              if (this.editor.isActive("heading", { level: 3 })) {
                return this.editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: 3 })
                  .run();
              }

              const { state } = this.editor;
              const { $from } = state.selection;

              // Eğer paragrafın başında dropcap varsa, önce onu normal harfe çevir
              if (
                $from.parent.type.name === "paragraph" &&
                $from.parent.firstChild?.type.name === "dropcap"
              ) {
                toggleParagraphDropcap(this.editor); // dropcap'i kaldırıp harfi metne geri koyar
              }

              return this.editor
                .chain()
                .focus()
                .clearNodes() // Önce sarmalı kır
                .toggleHeading({ level: 3 })
                .run();
            },

            "Mod-Shift-g": () => {
              const { $from } = this.editor.state.selection;
              const isDropcapActive = !!(
                this.editor.isActive("paragraph") &&
                $from.parent?.firstChild?.type.name === "dropcap"
              );

              // Zaten aktifse her zaman kapatılabilsin (kullanıcı geri alabilmeli),
              // ama henüz aktif değilse koşula uymalı
              if (!isDropcapActive && !isDropcapEligible(this.editor)) {
                return false; // koşul sağlanmıyor, kısayolu işleme
              }

              toggleParagraphDropcap(this.editor); // var olan helper'ı çağır, toggle işini o yapsın
              return true; // kısayolun "handle edildi" demesi şart
            },

            // 4, 5, 6 seviyelerini kasıtlı olarak devre dışı bırak
            "Mod-Alt-4": () => true,
            "Mod-Alt-5": () => true,
            "Mod-Alt-6": () => true,

            // (> + Space mantığı) buraya konulabilir
            // handleKeyDown yerine doğrudan eklentinin kendi kurallarına gömüyoruz

            addInputRules() {
              // Eğer girdileri tamamen özelleştirmek istersen burayı kullanabilirsin.
              // Ancak üstte handleKeyDown ile yaptığımız spesifik "zaten blockquote içindeyse saf metin bas"
              // mantığı klavye dinleyicisinde kalabilir ya da buradaki kurallar tamamen sıfırlanabilir.
              return [];
            },
          };
        },
      }).configure({
        levels: [1, 2, 3],
      }),
    ],
    autofocus: false,
    content: content || {
      type: "doc",
      content: [{ type: "heading", attrs: { level: 1 }, content: [] }],
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();

      let h1Count = 0;
      let hasChanged = false;

      // Mevcut imleç pozisyonunu hafızaya alıyoruz
      const { selection } = editor.state;
      const currentAnchor = selection.anchor;

      // Arka planda değişiklikleri toplamak için bir transaction başlatıyoruz
      const tr = editor.state.tr;

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading" && node.attrs.level === 1) {
          h1Count++;
          // Eğer bu, dökümandaki İKİNCİ veya daha sonraki bir H1 ise
          if (h1Count > 1) {
            // 🔥 ÇÖZÜM: setNodeSelection ile satırı seçmek yerine,
            // doğrudan o pozisyondaki node'un niteliğini H2 yapıyoruz. İmleç bundan etkilenmez!
            tr.setNodeAttribute(pos, "level", 2);
            hasChanged = true;
          }
        }
        return true;
      });

      if (hasChanged) {
        // Geçmişi (Undo-Redo) bozmamak için addToHistory: false ile transaction'ı uyguluyoruz
        tr.setMeta("addToHistory", false);
        editor.view.dispatch(tr);

        // İmleci kullanıcının kaldığı tam olarak aynı noktaya geri kilitliyoruz
        editor.commands.setTextSelection(currentAnchor);

        onUpdateRef.current(editor.getJSON());
      } else {
        onUpdateRef.current(json);
      }
    },
    editorProps: {
      handleKeyDown(view, event) {
        const mod = event.metaKey || event.ctrlKey;
        if (mod && ["b", "i", "k"].includes(event.key)) {
          const isHeading =
            view.state.doc.resolve(view.state.selection.from).parent.type
              .name === "heading";
          if (isHeading) {
            event.preventDefault();
            return true;
          }
        }

        // codeblock toggle
        if (editor && mod && event.altKey && event.key === "c") {
          event.preventDefault();
          if (editor.isActive("blockquote")) {
            editor.chain().focus().clearNodes().toggleCodeBlock().run();
          } else {
            editor.chain().focus().toggleCodeBlock().run();
          }
          return true;
        }

        if (editor && (event.key === " " || event.code === "Space")) {
          const { state } = editor;
          const { $from } = state.selection;

          // 1. Zaten bir blockquote içinde miyiz kontrol et
          const isAlreadyInBlockquote =
            $from.node($from.depth - 1)?.type.name === "blockquote" ||
            $from.parent.type.name === "blockquote" ||
            editor.isActive("blockquote");

          // 2. İmlecin solundaki metni kontrol et
          const currentLineText = $from.parent.textContent;
          const cursorPositionInLine = $from.parentOffset;

          // İmleç tam olarak satır başındaki '>' işaretinin sağındaysa
          const isRightAfterChevron =
            currentLineText.substring(0, cursorPositionInLine).trim() === ">";

          // 💡 KRİTİK AYRIM BURADA:
          if (isAlreadyInBlockquote && isRightAfterChevron) {
            // EĞER BLOCKQUOTE VARSA: Tiptap'ın otomatik makrosunu engelle
            event.preventDefault();

            // Normal yazım standartı: Araya sadece normal bir boşluk enjekte et
            // Zaten satır başında '>' yazıyordu, yanına boşluk gelince saf metin olarak '> ' kalmış olacak
            editor.chain().focus().insertContent(" ").run();

            return true; // ProseMirror'a bu tuşu bizim tükettiğimizi bildir
          }

          // EĞER BLOCKQUOTE YOKSA: Kod bu if bloğuna hiç girmeyecek,
          // Tiptap'ın kendi default mekanizması çalışıp pürüzsüzce blockquote'u oluşturacak.
        }

        return false;
      },

      handleDrop: function (view, event, slice, moved) {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0];
          if (/image\//.test(file.type)) {
            if (!postIdRef.current) {
              alert(
                "Resim eklemeden önce lütfen şık bir başlık yazıp taslak oluşturulmasını bekleyin.",
              );
              return true;
            }

            const localBlobUrl = URL.createObjectURL(file);

            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({
                  src: localBlobUrl,
                  width: "50%",
                  height: "auto",
                  aspectRatio: null,
                }),
              ),
            );

            Promise.all([
              getImageRatio(localBlobUrl),
              uploadImageToBackend(file, postIdRef.current),
            ])
              .then(([ratio, res]) => {
                const finalUrl = extractUrl(res);
                const { state } = view;
                const tr = state.tr;
                let changed = false;

                state.doc.descendants((node, pos) => {
                  if (
                    node.type.name === "image" &&
                    node.attrs.src === localBlobUrl
                  ) {
                    if (finalUrl) tr.setNodeAttribute(pos, "src", finalUrl);
                    tr.setNodeAttribute(pos, "aspectRatio", ratio.toString()); // String eşleme garantisi
                    tr.setNodeAttribute(pos, "width", "50%");
                    changed = true;
                  }
                  return true;
                });
                if (changed) {
                  view.dispatch(tr);
                  onUpdateRef.current(view.state.doc.toJSON());
                }
              })
              .catch((err) => console.error("Drop hatası:", err));
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

                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({
                      src: localBlobUrl,
                      width: "50%",
                      height: "auto",
                      aspectRatio: null,
                    }),
                  ),
                );

                Promise.all([
                  getImageRatio(localBlobUrl),
                  uploadImageToBackend(file, postIdRef.current),
                ])
                  .then(([ratio, res]) => {
                    const finalUrl = extractUrl(res);
                    if (finalUrl) {
                      const { state } = view;
                      const tr = state.tr;
                      let changed = false;
                      state.doc.descendants((node, pos) => {
                        if (
                          node.type.name === "image" &&
                          node.attrs.src === localBlobUrl
                        ) {
                          tr.setNodeAttribute(pos, "src", finalUrl);
                          tr.setNodeAttribute(
                            pos,
                            "aspectRatio",
                            ratio.toString(),
                          );
                          tr.setNodeAttribute(pos, "width", "50%");
                          changed = true;
                        }
                        return true;
                      });
                      if (changed) {
                        view.dispatch(tr);
                        onUpdateRef.current(view.state.doc.toJSON());
                      }
                    }
                  })
                  .catch((err) =>
                    console.error("Görsel yapıştırma backend hatası:", err),
                  );
                return true;
              }
            }
          }
        }
        return false;
      },
      attributes: {
        class:
          "tiptap prose prose-lg max-w-none focus:outline-none h-full pt-24 mb-18",
      },
    },
  });

  useEffect(() => {
    if (editor && !isContentInitialized.current) {
      if (content && Object.keys(content).length > 0) {
        // Eğer veritabanından dolu bir içerik geliyorsa onu yükle
        editor.commands.setContent(content);
      } else {
        // 🔥 KRİTİK ADIM: Eğer gelen içerik boşsa, şablonu buraya zorunlu enjekte ediyoruz!
        editor.commands.setContent({
          type: "doc",
          content: [
            { type: "heading", attrs: { level: 1 }, content: [] },
            { type: "paragraph", content: [] },
          ],
        });
      }

      isContentInitialized.current = true;

      // 🔥 SİNSİ BUG ÇÖZÜMÜ: Sayfa yenilendiğinde ProseMirror'ın placeholder'ları
      // taraması için editörü görünmez bir anlığına start pozisyonuna odaklayıp bırakıyoruz.
      setTimeout(() => {
        if (!editor.isDestroyed) {
          editor.commands.focus("start");
        }
      }, 50);
    }
  }, [editor, content]);

  const openAltModal = () => {
    if (!editor) return;
    const attrs = editor.getAttributes("image");
    setEditingImageAttrs({ src: attrs.src, alt: attrs.alt || "" });
    setIsAltModalOpen(true);
  };

  useEffect(() => {
    if (!editor) return;
    const handler = () => openAltModal();
    editor.on("openAltModal" as any, handler);
    return () => {
      editor.off("openAltModal" as any, handler);
    };
  }, [editor]);

  const saveAltText = (newAlt: string) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes("image", { alt: newAlt }).run();
    setIsAltModalOpen(false);
  };

  const setImageSize = (sizePercentage: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .updateAttributes("image", { width: sizePercentage, height: "auto" })
      .run();
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const handleImageUpload = () => {
    if (!postIdRef.current) {
      alert(
        "Görsel yüklemeden önce lütfen bir başlık yazın ve taslağın oluşmasını bekleyin.",
      );
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      if (!input.files?.length || !editor) return;

      const file = input.files[0];
      const localBlobUrl = URL.createObjectURL(file);
      const ratio = await getImageRatio(localBlobUrl);

      editor.view.dispatch(
        editor.view.state.tr.replaceSelectionWith(
          editor.view.state.schema.nodes.image.create({
            src: localBlobUrl,
            width: "50%",
            height: "auto",
            aspectRatio: ratio.toString(),
          }),
        ),
      );

      try {
        const uploadResult = await uploadImageToBackend(
          file,
          postIdRef.current!,
        );
        const finalUrl = extractUrl(uploadResult);
        if (!finalUrl) {
          alert("Görsel yüklenirken bir hata oluştu veya geçersiz URL döndü.");
          return;
        }

        const currentState = editor.view.state;
        const tr = currentState.tr;
        let changed = false;

        currentState.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.src === localBlobUrl) {
            tr.setNodeAttribute(pos, "src", finalUrl);
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

  // bubble-menu
  useEffect(() => {
    if (!editor) return;

    // ── Toolbar DOM'u oluştur ──────────────────────────────────────
    const toolbar = document.createElement("div");
    toolbar.className = "bubble-menu";

    // ── Toolbar içeriği ───────────────────────────────────────────
    toolbar.innerHTML = `
    <div class="bm-btns">
      <button data-action="bold"     class="bm-btn" title="Kalın">B</button>
      <button data-action="italic"   class="bm-btn" title="İtalik">i</button>
      <button data-action="link"     class="bm-btn" title="Link">         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
      <div class="bm-divider"></div>
      <button data-action="heading"  class="bm-btn" title="Başlık">T</button>
      <button data-action="heading3" class="bm-btn" title="Alt Başlık">T</button>
      <div class="bm-divider"></div>
      <button data-action="code"     class="bm-btn" title="Kod">         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></button>
      <button data-action="quote"    class="bm-btn" title="Alıntı">"</button>
      <button data-action="dropcap" class="bm-btn bm-dropcap" title="Drop Cap" style="display:none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="8" height="12" rx="1"/><line x1="3" y1="20" x2="21" y2="20"/><line x1="14" y1="8" x2="21" y2="8"/><line x1="14" y1="13" x2="19" y2="13"/></svg>
      </button>
    </div>
    <div class="bm-link-input" style="display:none;align-items:center;gap:6px;padding:0 4px;">
      <input type="url" placeholder="https://..." style="border:none;outline:none;background:transparent;color:#fff;font-size:13px;font-family:sans-serif;width:180px;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:2px;" />
      <button class="bm-link-confirm" style="font-size:12px;color:#60a5fa;cursor:pointer;background:none;border:none;font-family:sans-serif;padding:0;">Ekle</button>
    </div>
  `;

    document.body.appendChild(toolbar);
    bubbleToolbarRef.current = toolbar;

    // ── Aktif buton state'ini güncelle ───────────────────────────
    const syncActiveStates = () => {
      const isHeading =
        editor.isActive("heading", { level: 1 }) ||
        editor.isActive("heading", { level: 2 }) ||
        editor.isActive("heading", { level: 3 });

      const isCode = editor.isActive("code");
      const isBlockQuote = editor.isActive("blockquote");

      const btns = toolbar.querySelectorAll<HTMLButtonElement>(".bm-btn");
      btns.forEach((btn) => {
        const action = btn.dataset.action;
        let active = false;
        let disabled = false;
        if (action === "bold") {
          active = editor.isActive("bold");
          disabled = isHeading || isCode;
        }
        if (action === "italic") {
          active = editor.isActive("italic");
          disabled = isHeading || isCode || isBlockQuote;
        }
        if (action === "link") {
          active = editor.isActive("link");
          disabled = isHeading || isCode || isBlockQuote;
        }
        if (action === "heading") {
          active =
            editor.isActive("heading", { level: 1 }) ||
            editor.isActive("heading", { level: 2 });
        }
        if (action === "heading3") {
          active = editor.isActive("heading", { level: 3 });
        }
        if (action === "code") active = editor.isActive("code");

        if (action === "quote") {
          const { state } = editor;
          const { from, to } = state.selection;

          let totalBlocks = 0;
          let quoteBlocks = 0;

          state.doc.nodesBetween(from, to, (node) => {
            if (node.isBlock && node.type.name !== "doc") {
              totalBlocks++;
              // 🔥 Burada da "blockquote" kontrolü yapıyoruz
              if (node.type.name === "blockquote") quoteBlocks++;
              return false;
            }
          });

          active = totalBlocks > 0 && quoteBlocks === totalBlocks;
        }

        if (action === "dropcap") {
          const { $from } = editor.state.selection;
          active = !!(
            editor.isActive("paragraph") &&
            $from.parent?.firstChild?.type.name === "dropcap"
          );
        }
        btn.classList.toggle("active", active && !disabled);
        btn.classList.toggle("bm-disabled", disabled);
      });

      // Dropcap butonunu göster/gizle
      const dropcapBtn = toolbar.querySelector<HTMLElement>(".bm-dropcap");
      if (dropcapBtn) {
        const showDropcap = isDropcapEligible(editor);
        dropcapBtn.style.display = showDropcap ? "" : "none";
      }
    };

    // ── Toolbar pozisyonunu hesapla ve göster/gizle ──────────────
    let rafId = 0;
    const updatePosition = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { selection, doc } = editor.state;
        const isImage = editor.isActive("image");
        const isHRule = editor.isActive("horizontalRule");
        const isCodeBlock = editor.isActive("codeBlock");
        const isEmpty = selection.empty;

        const linkInputEl =
          toolbar.querySelector<HTMLElement>(".bm-link-input");
        const linkActive = linkInputEl?.style.display === "flex";

        if (isEmpty || isImage || isHRule || isCodeBlock) {
          // Link input açıksa kapat
          if (linkInputEl) linkInputEl.style.display = "none";
          const btnsEl = toolbar.querySelector<HTMLElement>(".bm-btns");
          if (btnsEl) btnsEl.style.display = "flex";
          toolbar.style.opacity = "0";
          toolbar.style.pointerEvents = "none";
          toolbar.style.transform = `translateY(6px) translateX(-50%)`;
          return;
        }

        // Seçilen metnin koordinatını al
        const { from, to } = selection;
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const midX = (start.left + end.left) / 2;
        const topY = Math.min(start.top, end.top);

        toolbar.style.left = `${midX}px`;
        toolbar.style.top = `${topY - 12}px`;
        toolbar.style.transform = `translateY(-100%) translateX(-50%)`;
        toolbar.style.opacity = "1";
        toolbar.style.pointerEvents = "auto";

        syncActiveStates();
      });
    };

    // ── Editor transaction'larını dinle ──────────────────────────
    editor.on("transaction", updatePosition);
    editor.on("blur", () => {
      // Link input açıksa blur'da kapanmasın
      const linkInputEl = toolbar.querySelector<HTMLElement>(".bm-link-input");
      if (linkInputEl?.style.display === "flex") return;
      setTimeout(() => {
        if (!editor.isFocused) {
          toolbar.style.opacity = "0";
          toolbar.style.pointerEvents = "none";
        }
      }, 150);
    });

    // ── Buton click handler'ları ──────────────────────────────────
    const normalizeUrl = (url: string) => {
      if (!url) return "";
      return url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    };

    toolbar.addEventListener("mousedown", (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-action]",
      );
      if (!btn) return;
      if (btn.classList.contains("bm-disabled")) return;

      e.preventDefault();

      const action = btn.dataset.action!;
      const btnsEl = toolbar.querySelector<HTMLElement>(".bm-btns");
      const linkInputEl = toolbar.querySelector<HTMLElement>(".bm-link-input");
      const linkInput = toolbar.querySelector<HTMLInputElement>(
        ".bm-link-input input",
      );

      if (action === "bold") {
        editor.chain().focus().toggleBold().run();
        return;
      }
      if (action === "italic") {
        editor.chain().focus().toggleItalic().run();
        return;
      }
      if (action === "code") {
        if (editor.isActive("heading"))
          editor.chain().focus().setParagraph().run();
        editor.chain().focus().toggleCode().run();
        return;
      }
      if (action === "quote") {
        // Adım 1: Önce blockquote durumunu mevcut state'den ölç
        const initialState = editor.state;
        const { from, to } = initialState.selection;

        let totalBlocks = 0;
        let quoteBlocks = 0;

        initialState.doc.nodesBetween(from, to, (node) => {
          if (node.isBlock && node.type.name !== "doc") {
            totalBlocks++;
            if (node.type.name === "blockquote") quoteBlocks++;
            return false;
          }
        });

        const allSelectedAreQuote =
          totalBlocks > 0 && quoteBlocks === totalBlocks;

        // Adım 2: Hepsi blockquote ise direkt çık
        if (allSelectedAreQuote) {
          editor.chain().focus().lift("blockquote").run();
          return;
        }

        // Adım 3: Heading, dropcap vs. hepsini temizle
        editor.chain().focus().clearNodes().run();

        // Adım 4: clearNodes sonrası taze state'den dropcap tara
        const afterClearState = editor.state;
        const freshFrom = afterClearState.selection.from;
        const freshTo = afterClearState.selection.to;

        afterClearState.doc.nodesBetween(freshFrom, freshTo, (node, pos) => {
          if (
            node.type.name === "paragraph" &&
            node.firstChild?.type.name === "dropcap"
          ) {
            const letter = node.firstChild.attrs.letter || "";
            const paragraphStart = pos + 1;
            editor
              .chain()
              .deleteRange({ from: paragraphStart, to: paragraphStart + 1 })
              .insertContentAt(paragraphStart, letter)
              .run();
          }
          return true;
        });

        // Adım 5: Temiz paragrafları blockquote'a sarmala
        editor.chain().focus().wrapIn("blockquote").run();
        return;
      }

      if (action === "dropcap") {
        if (editor.isActive("blockquote"))
          editor.chain().focus().toggleBlockquote().run();

        if (editor.isActive("heading"))
          editor.chain().focus().setParagraph().run();
        toggleParagraphDropcap(editor);
        return;
      }

      if (action === "heading") {
        const { $from } = editor.state.selection;
        if ($from.parent.firstChild?.type.name === "dropcap") {
          toggleParagraphDropcap(editor);
        }

        if (editor.isActive("bold")) editor.chain().focus().toggleBold().run();
        if (editor.isActive("italic"))
          editor.chain().focus().toggleItalic().run();

        if (editor.isActive("code")) editor.chain().focus().toggleCode().run();

        // Çoklu seçimde araya sıkışmış blockquote, list veya diğer yapısal düğümleri tamamen yırtıp dökümanı düzleştiriyoruz.
        editor.chain().focus().clearNodes().run();

        const hasH1 = editor
          .getJSON()
          .content?.some(
            (n: any) => n.type === "heading" && n.attrs?.level === 1,
          );
        if (hasH1) editor.chain().focus().toggleHeading({ level: 2 }).run();
        else editor.chain().focus().toggleHeading({ level: 1 }).run();
        return;
      }

      if (action === "heading3") {
        const { $from } = editor.state.selection;
        if ($from.parent.firstChild?.type.name === "dropcap") {
          toggleParagraphDropcap(editor);
        }

        if (editor.isActive("bold")) editor.chain().focus().toggleBold().run();
        if (editor.isActive("italic"))
          editor.chain().focus().toggleItalic().run();

        if (editor.isActive("code")) editor.chain().focus().toggleCode().run();

        // Blockquote sarmalları çoklu seçimde de tamamen eriyor
        editor.chain().focus().clearNodes().run();

        editor.chain().focus().toggleHeading({ level: 3 }).run();
        return;
      }

      if (action === "link") {
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run();
          return;
        }
        // Link input'u aç
        if (btnsEl && linkInputEl && linkInput) {
          btnsEl.style.display = "none";
          linkInputEl.style.display = "flex";
          linkInput.value = "";
          linkInput.focus();
        }
        return;
      }
    });

    // Link input: Enter / Escape / Confirm butonu
    const linkInput = toolbar.querySelector<HTMLInputElement>(
      ".bm-link-input input",
    );
    const linkConfirm = toolbar.querySelector<HTMLElement>(".bm-link-confirm");
    const btnsEl = toolbar.querySelector<HTMLElement>(".bm-btns");
    const linkInputEl = toolbar.querySelector<HTMLElement>(".bm-link-input");

    const confirmLink = () => {
      const url = normalizeUrl(linkInput?.value || "");
      if (url) editor.chain().focus().setLink({ href: url }).run();
      if (btnsEl) btnsEl.style.display = "flex";
      if (linkInputEl) linkInputEl.style.display = "none";
    };

    const cancelLink = () => {
      editor.chain().focus().run();
      if (btnsEl) btnsEl.style.display = "flex";
      if (linkInputEl) linkInputEl.style.display = "none";
    };

    linkInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmLink();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        cancelLink();
      }
    });

    linkConfirm?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      confirmLink();
    });

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      editor.off("transaction", updatePosition);
      toolbar.remove();
      bubbleToolbarRef.current = null;
    };
  }, [editor]);

  if (!editor) return null;

  // 🔥 GÜVENLİ VE KİLİTLENMEYEN ASPECT RATIO HESAPLAMASI
  const currentAttrs = editor.getAttributes("image");
  const currentWidth = currentAttrs.width || "50%";

  const rawAspectRatio = currentAttrs.aspectRatio;
  const aspectRatio =
    rawAspectRatio !== null &&
    rawAspectRatio !== undefined &&
    rawAspectRatio !== ""
      ? parseFloat(rawAspectRatio)
      : null;

  const ratioKnown =
    aspectRatio !== null && !isNaN(aspectRatio) && aspectRatio !== 0;

  const canBeMedium = ratioKnown ? aspectRatio >= 0.85 : true;
  const canBeFull = ratioKnown ? aspectRatio >= 1.2 : true;

  return (
    <div className="relative w-full group/editor playfair-display-400 bg-white">
      <style jsx global>{`
        .tiptap .ProseMirror {
          overflow-x: visible !important;
        }
        .tiptap img + ::after {
          display: none !important;
        }
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
        options={{
          placement: "left",
          offset: { mainAxis: -110, crossAxis: 0 },
          shift: false,
          flip: false,
        }}
        shouldShow={({ state }) => {
          if (!editor || editor.isDestroyed) return false; // 🔥 GÜVENLİK KİLİDİ
          const { selection } = state;
          if (!selection) return false; // 🔥 SEÇİM KONTROLÜ

          const { $from } = selection;
          return (
            (editor.isFocused || editor.isEmpty) &&
            $from.parent.type.name === "paragraph" &&
            $from.parent.content.size === 0
          );
        }}
      >
        <div className="floating-menu-container flex items-center gap-5 transition-all duration-200 group">
          <button className="flex items-center justify-center w-8 h-8 rounded-full border border-black bg-white text-gray-700 transition-all cursor-pointer">
            <span className="group-hover:rotate-90 transition-transform">
              <GoPlus size={20} />
            </span>
          </button>
          <div className="flex items-center gap-2 transition-all duration-200">
            <button
              onClick={handleImageUpload}
              className="flex items-center justify-center w-8 h-8 rounded-full text-green-600 opacity-0 border border-green-300 hover:border-green-500 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <MdOutlineAddPhotoAlternate size={18} />
            </button>
            <button
              onClick={() => {
                if (editor.isActive("blockquote")) {
                  editor.chain().focus().clearNodes().toggleCodeBlock().run;
                } else {
                  editor.chain().focus().toggleCodeBlock().run;
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 opacity-0 border border-blue-300 hover:border-blue-500 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <GoCode size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 border border-gray-300 hover:border-gray-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <span className="font-bold text-lg leading-none">···</span>
            </button>
          </div>
        </div>
      </FloatingMenu>

      {editor.isActive("codeBlock") && (
        <div className="absolute right-2 top-2 z-[60] backdrop-blur-md p-1 flex gap-1">
          <select
            className="text-zinc-700 text-[10px] tracking-wider outline-none cursor-pointer"
            value={editor.getAttributes("codeBlock").language || "auto"}
            onChange={(e) => {
              const val = e.target.value === "auto" ? null : e.target.value;
              editor
                .chain()
                .focus()
                .updateAttributes("codeBlock", { language: val })
                .run();
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
            <h3 className="text-2xl font-bold">
              Resim Alt Yazısı / Açıklaması
            </h3>
            <img
              src={editingImageAttrs.src}
              alt="Önizleme"
              className="max-w-xs h-64 object-cover rounded-md shadow-lg"
              style={{ width: currentWidth }}
            />
            <input
              autoFocus
              type="text"
              placeholder="Görselin altına şık bir açıklama yazın..."
              className="w-full px-4 py-2 border-b border-gray-400 outline-none bg-transparent text-center text-lg"
              value={editingImageAttrs.alt}
              onChange={(e) =>
                setEditingImageAttrs({
                  ...editingImageAttrs,
                  alt: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAltText(editingImageAttrs.alt);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => saveAltText(editingImageAttrs.alt)}
                className="px-5 py-2 text-green-600 border border-green-600 rounded-full hover:bg-green-50 transition-all cursor-pointer"
              >
                Kaydet
              </button>
              <button
                onClick={() => setIsAltModalOpen(false)}
                className="px-5 py-2 text-gray-500 border border-gray-500 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};
export default TiptapEditor;
