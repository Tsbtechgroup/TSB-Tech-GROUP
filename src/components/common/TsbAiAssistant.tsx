import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { FormEvent } from "react";

import {
  ArrowRight,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { assistantTranslations } from "../../i18n/locales/assistant";
import {
  detectAssistantIntent,
  type AssistantActionId,
} from "../../config/assistantKnowledge";

import assistantRobot from "../../assets/images/assistant/tsb-assistant-robot.png";

type AssistantAction = {
  id: AssistantActionId;
  href: string;
};

type ChatMessage =
  | {
      id: string;
      role: "user";
      text: string;
    }
  | {
      id: string;
      role: "assistant";
      answerKey: string;
      actionId?: AssistantActionId;
      href?: string;
    };

const STORAGE_KEY = "tsb_assistant_messages_v2";

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const ACTIONS: AssistantAction[] = [
  {
    id: "services",
    href: "/services",
  },
  {
    id: "quote",
    href: "/#quote",
  },
  {
    id: "contact",
    href: "/contact",
  },
  {
    id: "projects",
    href: "/projects",
  },
  {
    id: "store",
    href: "/store",
  },
  {
    id: "academy",
    href: "/academy",
  },
  {
    id: "business",
    href: "/business",
  },
];

function TsbAiAssistant() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      assistantTranslations,
      locale,
      `assistant.${key}`
    );

  const [isOpen, setIsOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [isThinking, setIsThinking] =
    useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ChatMessage[];
      }
    } catch {
      // Une session invalide ne doit jamais bloquer l’assistant.
    }

    return [
      {
        id: createId(),
        role: "assistant",
        answerKey: "welcome",
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // L’assistant reste utilisable si le stockage est désactivé.
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanInput =
      input.trim();

    if (!cleanInput) {
      return;
    }

    const result = detectAssistantIntent(cleanInput);

    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: "user",
        text: cleanInput,
      },
    ]);
    setInput("");
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          answerKey: result.answerKey,
          actionId: result.actionId,
          href: result.href,
        },
      ]);
      setIsThinking(false);
    }, 550);
  };

  const navigateTo = (
    href: string
  ) => {
    window.location.href = href;
  };

  return (
    <>
      <style>
        {`
          /* ==========================================
             TSB ASSISTANT DYNAMIC ROBOT SAFE V1.1
             ========================================== */

          .tsb-assistant__robot-launcher {
            width: 92px;
            height: 92px;

            position: relative;

            display: grid;
            place-items: center;

            padding: 0;

            border: 0;
            border-radius: 50%;

            background: transparent;

            cursor: pointer;

            animation:
              tsbRobotFloat
              4s
              ease-in-out
              infinite;
          }

          .tsb-assistant__robot-launcher::before {
            content: "";

            position: absolute;

            inset: 12px;

            border-radius: 50%;

            background:
              radial-gradient(
                circle,
                rgba(
                  19,
                  135,
                  255,
                  0.28
                )
                  0%,
                rgba(
                  19,
                  135,
                  255,
                  0.08
                )
                  55%,
                transparent
                  75%
              );

            box-shadow:
              0 0 25px
                rgba(
                  19,
                  135,
                  255,
                  0.35
                ),
              0 0 45px
                rgba(
                  39,
                  210,
                  255,
                  0.18
                );

            animation:
              tsbRobotGlow
              2.8s
              ease-in-out
              infinite;
          }

          .tsb-assistant__robot-launcher::after {
            content: "";

            position: absolute;

            inset: 8px;

            border-radius: 50%;

            border:
              1px solid
              rgba(
                83,
                167,
                255,
                0.22
              );

            animation:
              tsbRobotRing
              3.4s
              ease-in-out
              infinite;
          }

          .tsb-assistant__robot-image {
            position: relative;

            z-index: 2;

            width: 88px;
            height: 88px;

            object-fit: contain;

            pointer-events: none;

            filter:
              drop-shadow(
                0 12px 18px
                rgba(
                  0,
                  0,
                  0,
                  0.32
                )
              )
              drop-shadow(
                0 0 12px
                rgba(
                  19,
                  135,
                  255,
                  0.28
                )
              );

            transition:
              transform
                0.25s
                ease,
              filter
                0.25s
                ease;
          }

          .tsb-assistant__robot-launcher:hover
            .tsb-assistant__robot-image {
            transform:
              scale(1.08)
              rotate(-3deg);

            filter:
              drop-shadow(
                0 14px 20px
                rgba(
                  0,
                  0,
                  0,
                  0.35
                )
              )
              drop-shadow(
                0 0 20px
                rgba(
                  19,
                  135,
                  255,
                  0.48
                )
              );
          }

          .tsb-assistant__robot-badge {
            position: absolute;

            z-index: 3;

            right: 2px;
            top: 2px;

            width: 27px;
            height: 27px;

            display: grid;
            place-items: center;

            border-radius: 50%;

            background:
              linear-gradient(
                135deg,
                #1387ff,
                #22c55e
              );

            color: #ffffff;

            box-shadow:
              0 0 0 3px
                #020711,
              0 6px 15px
                rgba(
                  19,
                  135,
                  255,
                  0.35
                );
          }

          .tsb-assistant__robot-avatar {
            width: 44px;
            height: 44px;

            display: grid;
            place-items: center;

            flex-shrink: 0;

            overflow: hidden;

            border-radius: 14px;

            border:
              1px solid
              rgba(
                83,
                167,
                255,
                0.25
              );

            background:
              radial-gradient(
                circle,
                rgba(
                  19,
                  135,
                  255,
                  0.16
                ),
                rgba(
                  2,
                  7,
                  17,
                  0.96
                )
              );

            box-shadow:
              0 0 18px
                rgba(
                  19,
                  135,
                  255,
                  0.14
                );
          }

          .tsb-assistant__robot-avatar
            img {
            width: 100%;
            height: 100%;

            object-fit: cover;
          }

          .tsb-assistant__thinking {
            display: inline-flex;

            align-items: center;

            gap: 6px;

            min-height: 20px;
          }

          .tsb-assistant__conversation {
            display: grid;
            gap: 12px;
            max-height: 330px;
            overflow-y: auto;
            padding-right: 4px;
            scroll-behavior: smooth;
          }

          .tsb-assistant__message--user {
            justify-self: end;
            max-width: 88%;
            margin-left: 34px;
            background: linear-gradient(
              135deg,
              rgba(19, 135, 255, 0.24),
              rgba(39, 210, 255, 0.12)
            );
            border-color: rgba(83, 167, 255, 0.3);
          }

          .tsb-assistant__message-content {
            display: grid;
            gap: 10px;
            min-width: 0;
          }

          .tsb-assistant__message-content p,
          .tsb-assistant__message--user p {
            margin: 0;
            overflow-wrap: anywhere;
          }

          .tsb-assistant__message-action {
            width: fit-content;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 11px;
            border: 1px solid rgba(83, 167, 255, 0.32);
            border-radius: 10px;
            background: rgba(19, 135, 255, 0.13);
            color: #dceeff;
            font: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
          }

          .tsb-assistant__message-action:hover {
            background: rgba(19, 135, 255, 0.24);
            border-color: rgba(83, 167, 255, 0.55);
          }

          .tsb-assistant__thinking
            span {
            width: 7px;
            height: 7px;

            display: block;

            border-radius: 50%;

            background:
              #53a7ff;

            animation:
              tsbAssistantTyping
              1s
              ease-in-out
              infinite;
          }

          .tsb-assistant__thinking
            span:nth-child(2) {
            animation-delay:
              0.14s;
          }

          .tsb-assistant__thinking
            span:nth-child(3) {
            animation-delay:
              0.28s;
          }

          @keyframes tsbRobotFloat {
            0%,
            100% {
              transform:
                translateY(0)
                rotate(0deg);
            }

            25% {
              transform:
                translateY(-4px)
                rotate(-1deg);
            }

            50% {
              transform:
                translateY(-9px)
                rotate(1deg);
            }

            75% {
              transform:
                translateY(-4px)
                rotate(-1deg);
            }
          }

          @keyframes tsbRobotGlow {
            0%,
            100% {
              opacity: 0.65;
              transform:
                scale(0.92);
            }

            50% {
              opacity: 1;
              transform:
                scale(1.08);
            }
          }

          @keyframes tsbRobotRing {
            0%,
            100% {
              opacity: 0.35;
              transform:
                scale(0.94);
            }

            50% {
              opacity: 0.8;
              transform:
                scale(1.08);
            }
          }

          @keyframes tsbAssistantTyping {
            0%,
            80%,
            100% {
              opacity: 0.35;
              transform:
                translateY(0);
            }

            40% {
              opacity: 1;
              transform:
                translateY(-4px);
            }
          }

          @media (
            prefers-reduced-motion:
              reduce
          ) {
            .tsb-assistant__robot-launcher,
            .tsb-assistant__robot-launcher::before,
            .tsb-assistant__robot-launcher::after,
            .tsb-assistant__thinking
              span {
              animation:
                none !important;
            }
          }

          @media (
            max-width: 640px
          ) {
            .tsb-assistant__robot-launcher {
              width: 78px;
              height: 78px;
            }

            .tsb-assistant__robot-image {
              width: 74px;
              height: 74px;
            }

            .tsb-assistant__robot-badge {
              width: 24px;
              height: 24px;

              right: 0;
              top: 0;
            }
          }
        `}
      </style>

      <div className="tsb-assistant">
        {isOpen && (
          <section
            className="tsb-assistant__panel"
            aria-label={t("title")}
          >
            <header className="tsb-assistant__header">
              <div className="tsb-assistant__identity">
                <span className="tsb-assistant__robot-avatar">
                  <img
                    src={
                      assistantRobot
                    }
                    alt=""
                  />
                </span>

                <div>
                  <strong>
                    {t("title")}
                  </strong>

                  <span>
                    <span className="tsb-assistant__online-dot" />

                    {t("status")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="tsb-assistant__close"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label={t(
                  "close"
                )}
              >
                <X size={18} />
              </button>
            </header>

            <div className="tsb-assistant__body">
              <div className="tsb-assistant__conversation">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div
                      key={message.id}
                      className="tsb-assistant__message tsb-assistant__message--user"
                    >
                      <p>{message.text}</p>
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="tsb-assistant__message tsb-assistant__message--assistant"
                    >
                      <Sparkles
                        size={18}
                        aria-hidden="true"
                      />

                      <div className="tsb-assistant__message-content">
                        <p>{t(message.answerKey)}</p>

                        {message.href && message.actionId && (
                          <button
                            type="button"
                            className="tsb-assistant__message-action"
                            onClick={() => navigateTo(message.href!)}
                          >
                            <span>{t(`action.${message.actionId}`)}</span>
                            <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}

                {isThinking && (
                  <div className="tsb-assistant__message">
                    <Sparkles size={18} aria-hidden="true" />
                    <div className="tsb-assistant__thinking">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="tsb-assistant__actions">
                {ACTIONS.slice(
                  0,
                  6
                ).map(
                  (action) => (
                    <button
                      key={
                        action.id
                      }
                      type="button"
                      onClick={() =>
                        navigateTo(
                          action.href
                        )
                      }
                    >
                      <span>
                        {t(
                          `action.${action.id}`
                        )}
                      </span>

                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                      />
                    </button>
                  )
                )}
              </div>
            </div>

            <form
              className="tsb-assistant__form"
              onSubmit={
                handleSubmit
              }
            >
              <input
                type="text"
                value={input}
                onChange={(
                  event
                ) =>
                  setInput(
                    event
                      .target
                      .value
                  )
                }
                placeholder={t(
                  "placeholder"
                )}
                aria-label={t(
                  "placeholder"
                )}
                autoComplete="off"
              />

              <button
                type="submit"
                aria-label={t(
                  "send"
                )}
                disabled={
                  isThinking
                }
              >
                <Send
                  size={17}
                />
              </button>
            </form>

            <footer className="tsb-assistant__footer">
              {t("footer")}
            </footer>
          </section>
        )}

        <button
          type="button"
          className="tsb-assistant__robot-launcher"
          onClick={() =>
            setIsOpen(
              (current) =>
                !current
            )
          }
          aria-label={t(
            "launcher"
          )}
          aria-expanded={
            isOpen
          }
        >
          <img
            src={assistantRobot}
            alt=""
            className="tsb-assistant__robot-image"
          />

          <span className="tsb-assistant__robot-badge">
            {isOpen ? (
              <X size={14} />
            ) : (
              <Sparkles
                size={14}
              />
            )}
          </span>
        </button>
      </div>
    </>
  );
}

export default TsbAiAssistant;
