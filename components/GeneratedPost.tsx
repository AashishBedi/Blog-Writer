import React, { useState } from 'react';
import { Icon } from './Icon';

interface GeneratedPostProps {
    content: string;
}

const GeneratedPost: React.FC<GeneratedPostProps> = ({ content }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    // This function applies inline formatting rules to a given string.
    const applyInlineFormatting = (text: string) => {
        // Sanitize text to prevent XSS by escaping HTML characters.
        // The transformations below will re-introduce specific, safe HTML tags.
        let formattedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // IMPORTANT: The order of replacement matters to avoid conflicts.
        
        // Links: [text](url) -> <a href="url">text</a>
        // The regex ensures that the URL starts with http or https for security.
        formattedText = formattedText.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-500 hover:underline">$1</a>'
        );

        // Bold: **text** -> <strong>text</strong>
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic: _text_ or *text* -> <em>text</em>
        // The regex for single asterisks is crafted to avoid matching list items or parts of bold text.
        formattedText = formattedText.replace(/_([^_]+)_/g, '<em>$1</em>');
        formattedText = formattedText.replace(/(?<!\*)\*([^\s*][^*]*?)\*(?!\*)/g, '<em>$1</em>');
        
        // Inline code: `code` -> <code>code</code>
        formattedText = formattedText.replace(
            /`([^`]+)`/g,
            '<code class="bg-gray-200 dark:bg-gray-700 rounded-lg px-1.5 py-1 font-mono text-sm">$1</code>'
        );
        
        return formattedText;
    };

    const renderContent = () => {
        if (!content) return null;

        // First, split the entire content by multi-line code blocks.
        // This isolates code from other markdown processing.
        const blocks = content.split(/(```[\s\S]*?```)/g);

        return blocks.map((block, index) => {
            // Check if the block is a code block (it will be surrounded by ```)
            if (/^```/.test(block)) {
                // Extract the code content, removing the backticks and any language hint.
                const codeContent = block.replace(/^```[a-z]*\n|```$/g, '');
                // Sanitize the code content itself to prevent rendering any HTML inside.
                const sanitizedCode = codeContent
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

                return (
                    <pre key={`code-${index}`} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-4 my-4 overflow-x-auto">
                        <code className="font-mono text-sm">{sanitizedCode}</code>
                    </pre>
                );
            }

            // If it's not a code block, process it as regular markdown text.
            const lines = block.split('\n');
            // Fix: Use React.ReactElement[] to avoid dependency on global JSX namespace.
            const elements: React.ReactElement[] = [];
            let listItems: string[] = [];

            const flushListItems = () => {
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={`ul-${index}-${elements.length}`} className="list-disc list-inside space-y-2 my-4 pl-2">
                            {listItems.map((item, i) => (
                                <li key={i} dangerouslySetInnerHTML={{ __html: applyInlineFormatting(item.substring(2)) }} />
                            ))}
                        </ul>
                    );
                    listItems = [];
                }
            };

            lines.forEach((line, lineIndex) => {
                if (line.startsWith('## ')) {
                    flushListItems();
                    elements.push(<h2 key={`${index}-${lineIndex}`} className="text-2xl font-bold mt-8 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2" dangerouslySetInnerHTML={{ __html: applyInlineFormatting(line.substring(3)) }} />);
                } else if (line.startsWith('### ')) {
                    flushListItems();
                    elements.push(<h3 key={`${index}-${lineIndex}`} className="text-xl font-semibold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: applyInlineFormatting(line.substring(4)) }} />);
                } else if (line.trim().startsWith('* ')) {
                    listItems.push(line);
                } else if (line.trim() === '') {
                    flushListItems();
                    // Render a break for empty lines to create paragraph spacing, but not at the start.
                    if (elements.length > 0) {
                       elements.push(<br key={`${index}-${lineIndex}`} />);
                    }
                } else {
                    flushListItems();
                    elements.push(<p key={`${index}-${lineIndex}`} className="leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: applyInlineFormatting(line) }} />);
                }
            });

            flushListItems(); // Flush any remaining list items at the end of the block.

            return <div key={`text-${index}`}>{elements}</div>;
        });
    };

    return (
        <div className="relative">
            <button
                onClick={handleCopy}
                className={`absolute top-0 right-0 mt-[-8px] mr-[-8px] sm:mt-0 sm:mr-0 flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    isCopied
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-label="Copy to clipboard"
            >
                {isCopied ? (
                    <>
                        <Icon icon="check" className="w-4 h-4 mr-2" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Icon icon="copy" className="w-4 h-4 mr-2" />
                        Copy
                    </>
                )}
            </button>
            <article className="prose dark:prose-invert max-w-none text-left">
                {renderContent()}
            </article>
        </div>
    );
};

export default GeneratedPost;