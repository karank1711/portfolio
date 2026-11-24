import { useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion.js';

/**
 * Reusable Typewriter component.
 *
 * Supports single or multiple text strings, configurable typing and deleting speeds,
 * custom pause durations, looping, and a blinking cursor.
 */
export function Typewriter({
  words = [],
  text,
  typingSpeed = 80,
  deletingSpeed = 45,
  pauseDuration = 2000,
  delayBetweenWords = 400,
  loop = true,
  cursor = true,
  showCursor = true,
  cursorChar = '|',
  cursorClassName = '',
  className = '',
  wrapper: Wrapper = 'span',
}) {
  const reduce = usePrefersReducedMotion();

  // Normalize input words: supports array of strings, single string, or text prop
  // Also cleanly splits multiline newline-separated strings
  const list = useMemo(() => {
    const raw = Array.isArray(words) && words.length > 0
      ? words
      : (typeof words === 'string' && words ? [words] : (typeof text === 'string' && text ? [text] : []));

    return raw
      .flatMap((item) => (typeof item === 'string' ? item.split('\n') : [item]))
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter(Boolean);
  }, [words, text]);

  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // If user prefers reduced motion, display the current full string directly
  useEffect(() => {
    if (reduce && list.length > 0) {
      setDisplayText(list[wordIndex % list.length] || list[0]);
    }
  }, [reduce, list, wordIndex]);

  useEffect(() => {
    if (reduce || list.length === 0) return;

    const currentWord = list[wordIndex % list.length] || '';

    // If looping is disabled and we completed the final word, stop
    if (!loop && wordIndex >= list.length - 1 && displayText === currentWord) {
      return;
    }

    let timeoutId;

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Full word typed, pause before deleting
        if (!loop && list.length === 1) return;
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        // Word completely erased: pause for delayBetweenWords,
        // then simultaneously advance wordIndex and set isDeleting to false.
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % list.length);
        }, delayBetweenWords);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [
    displayText,
    isDeleting,
    wordIndex,
    list,
    loop,
    reduce,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    delayBetweenWords,
  ]);

  if (list.length === 0) return null;

  const shouldShowCursor = cursor && showCursor;

  return (
    <Wrapper className={`inline-flex items-center ${className}`}>
      <span>{reduce ? (list[wordIndex % list.length] || list[0]) : displayText}</span>
      {shouldShowCursor ? (
        <span
          className={`ml-0.5 inline-block select-none font-normal ${cursorClassName}`}
          style={{ animation: 'typewriterCursor 0.85s step-start infinite' }}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      ) : null}
    </Wrapper>
  );
}
