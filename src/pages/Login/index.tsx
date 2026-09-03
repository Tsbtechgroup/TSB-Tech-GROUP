import {
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  FormEvent,
} from "react";
import BrandLogo from "../../components/common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { loginTranslations } from "../../i18n/locales/login";
import { supabase } from "../../services/supabase";
type TurnstileOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  language?: string;
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};
type TurnstileApi = {
  render: (
    container: HTMLElement | string,
    options: TurnstileOptions
  ) => string;
  reset: (
    widgetId?: string
  ) => void;

  remove: (
    widgetId: string
  ) => void;
};

const TURNSTILE_SCRIPT_ID =
  "tsb-turnstile-login-script";

const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function getTurnstile() {
  return (
    window as typeof window & {
      turnstile?: TurnstileApi;
    }
  ).turnstile;
}

function Login() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      loginTranslations,
      locale,
      `login.${key}`
    );

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    isResetLoading,
    setIsResetLoading,
  ] = useState(false);

  const [
    captchaToken,
    setCaptchaToken,
  ] = useState<string | null>(null);

  const [
    captchaReady,
    setCaptchaReady,
  ] = useState(false);

  const [
    captchaError,
    setCaptchaError,
  ] = useState("");

  const turnstileContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const turnstileWidgetIdRef =
    useRef<string | null>(
      null
    );

  const turnstileSiteKey =
    import.meta.env
      .VITE_TURNSTILE_SITE_KEY;

  /*
    ========================================================
    CLOUDFLARE TURNSTILE
    ========================================================
  */

  useEffect(() => {
    let active = true;

    const renderTurnstile = () => {
      const turnstile =
        getTurnstile();

      if (
        !active ||
        !turnstileSiteKey ||
        !turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      try {
        const widgetId =
          turnstile.render(
            turnstileContainerRef.current,
            {
              sitekey:
                turnstileSiteKey,

              theme:
                "dark",

              language:
                locale === "zh"
                  ? "zh-cn"
                  : locale,

              size:
                "flexible",

              callback: (
                token
              ) => {
                setCaptchaToken(
                  token
                );

                setCaptchaReady(
                  true
                );

                setCaptchaError(
                  ""
                );
              },

              "expired-callback":
                () => {
                  setCaptchaToken(
                    null
                  );

                  setCaptchaReady(
                    false
                  );

                  setCaptchaError(
                    t("messages.captchaExpired")
                  );
                },

              "error-callback":
                () => {
                  setCaptchaToken(
                    null
                  );

                  setCaptchaReady(
                    false
                  );

                  setCaptchaError(
                    t("messages.captchaValidationError")
                  );
                },
            }
          );

        turnstileWidgetIdRef.current =
          widgetId;
      } catch (error) {
        console.error(
          "Erreur chargement Turnstile :",
          error
        );

        setCaptchaError(
          t("messages.captchaLoadError")
        );
      }
    };

    if (!turnstileSiteKey) {
      setCaptchaError(
        t("messages.captchaMissingConfig")
      );

      return;
    }

    const existingTurnstile =
      getTurnstile();

    if (existingTurnstile) {
      renderTurnstile();
    } else {
      let script =
        document.getElementById(
          TURNSTILE_SCRIPT_ID
        ) as
          | HTMLScriptElement
          | null;

      if (!script) {
        script =
          document.createElement(
            "script"
          );

        script.id =
          TURNSTILE_SCRIPT_ID;

        script.src =
          TURNSTILE_SCRIPT_URL;

        script.async = true;
        script.defer = true;

        document.head.appendChild(
          script
        );
      }

      script.addEventListener(
        "load",
        renderTurnstile
      );

      return () => {
        active = false;

        script?.removeEventListener(
          "load",
          renderTurnstile
        );

        const turnstile =
          getTurnstile();

        if (
          turnstileWidgetIdRef.current &&
          turnstile
        ) {
          try {
            turnstile.remove(
              turnstileWidgetIdRef.current
            );
          } catch {
            // Rien à faire.
          }

          turnstileWidgetIdRef.current =
            null;
        }
      };
    }

    return () => {
      active = false;

      const turnstile =
        getTurnstile();

      if (
        turnstileWidgetIdRef.current &&
        turnstile
      ) {
        try {
          turnstile.remove(
            turnstileWidgetIdRef.current
          );
        } catch {
          // Rien à faire.
        }

        turnstileWidgetIdRef.current =
          null;
      }
    };
  }, [locale, turnstileSiteKey]);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaReady(false);
    setCaptchaError("");

    const turnstile =
      getTurnstile();

    if (
      turnstile &&
      turnstileWidgetIdRef.current
    ) {
      try {
        turnstile.reset(
          turnstileWidgetIdRef.current
        );
      } catch (error) {
        console.error(
          "Erreur reset Turnstile :",
          error
        );
      }
    }
  };

  /*
    ========================================================
    CONNEXION
    ========================================================
  */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage(
        t("messages.emailRequired")
      );

      return;
    }

    if (!password.trim()) {
      setMessage(
        t("messages.passwordRequired")
      );

      return;
    }

    if (!captchaToken) {
      setMessage(
        t("messages.captchaRequired")
      );

      return;
    }

    setIsLoading(true);
    setMessage("");

    let data;
    let error;

    try {
      const signInResult =
        await supabase.auth
          .signInWithPassword({
            email:
              email.trim(),

            password,

            options: {
              captchaToken,
            },
          });

      data = signInResult.data;
      error = signInResult.error;
    } catch (unexpectedError) {
      setIsLoading(false);

      resetCaptcha();

      console.error(
        "Erreur réseau ou erreur inattendue pendant la connexion :",
        unexpectedError
      );

      setMessage(
        t("messages.networkError")
      );

      return;
    }

    if (error) {
      setIsLoading(false);

      resetCaptcha();

      console.error(
        "Erreur connexion Supabase :",
        error
      );

      const authError = error as typeof error & {
        code?: string;
        status?: number;
      };

      if (
        authError.code ===
          "invalid_credentials" ||
        authError.status === 400
      ) {
        setMessage(
          t("messages.invalidCredentials")
        );
      } else {
        setMessage(
          t("messages.genericLoginError")
        );
      }

      return;
    }

    if (
      !data.session ||
      !data.user
    ) {
      setIsLoading(false);

      resetCaptcha();

      setMessage(
        t("messages.noSession")
      );

      return;
    }

    /*
      ========================================================
      VÉRIFICATION DU RÔLE
      ========================================================
    */

    const {
      data: adminRole,
      error: roleError,
    } = await supabase
      .from("user_roles")
      .select("role")
      .eq(
        "user_id",
        data.user.id
      )
      .eq(
        "role",
        "admin"
      )
      .maybeSingle();

    if (roleError) {
      console.error(
        "Erreur vérification rôle utilisateur :",
        roleError
      );

      setIsLoading(false);

      setMessage(
        t("messages.roleCheckError")
      );

      return;
    }

    const isAdmin =
      adminRole?.role ===
      "admin";

    /*
      ========================================================
      DEMANDE DE DEVIS EN ATTENTE
      ========================================================
    */

    const pendingQuote =
      sessionStorage.getItem(
        "tsb_pending_quote"
      );

    const hasPendingQuote =
      Boolean(
        pendingQuote
      );

    setIsLoading(false);

    /*
      ========================================================
      REDIRECTION
      ========================================================
    */

    if (isAdmin) {
      setMessage(
        t("messages.adminSuccess")
      );

      window.setTimeout(
        () => {
          window.location.href =
            "/admin";
        },
        900
      );

      return;
    }

    if (hasPendingQuote) {
      setMessage(
        t("messages.pendingQuoteSuccess")
      );

      window.setTimeout(
        () => {
          window.location.href =
            "/#quote";
        },
        900
      );

      return;
    }

    setMessage(
      t("messages.clientSuccess")
    );

    window.setTimeout(
      () => {
        window.location.href =
          "/client";
      },
      900
    );
  };

  /*
    ========================================================
    MOT DE PASSE OUBLIÉ
    ========================================================
  */

  const handleForgotPassword =
    async () => {
      if (!email.trim()) {
        setMessage(
          t("messages.forgotEmailRequired")
        );

        return;
      }

      if (!captchaToken) {
        setMessage(
          t("messages.forgotCaptchaRequired")
        );

        return;
      }

      setIsResetLoading(
        true
      );

      setMessage("");

      const redirectTo =
        `${window.location.origin}/reset-password`;

      try {
        const {
          error,
        } =
          await supabase.auth
            .resetPasswordForEmail(
              email.trim(),
              {
                redirectTo,
                captchaToken,
              }
            );

        setIsResetLoading(
          false
        );

        resetCaptcha();

        if (error) {
          console.error(
            "Erreur récupération mot de passe :",
            error
          );

          setMessage(
            t("messages.resetEmailError")
          );

          return;
        }

        setMessage(
          t("messages.resetEmailSent")
        );
      } catch (error) {
        setIsResetLoading(
          false
        );

        resetCaptcha();

        console.error(
          "Erreur récupération mot de passe :",
          error
        );

        setMessage(
          t("messages.resetGenericError")
        );
      }
    };

  /*
    ========================================================
    AFFICHAGE
    ========================================================
  */

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-brand">
          <a
            href="/"
            aria-label={t("brandAria")}
          >
            <BrandLogo />
          </a>

          <div className="login-kicker">
            TSB DIGITAL PLATFORM
          </div>

          <h1>
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")}
          </h1>

          <p>
            {t("heroIntro")}
          </p>

          <a
            href="/"
            className="login-back"
          >
            ← {t("backSite")}
          </a>
        </section>

        <section className="login-card">
          <span className="login-card__eyebrow">
            LOGIN-001
          </span>

          <h2>
            {t("title")}
          </h2>

          <p className="login-card__intro">
            {t("intro")}
          </p>

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >
            <div className="login-field">
              <label htmlFor="login-email">
                {t("emailLabel")}
              </label>

              <input
                id="login-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={
                  email
                }
                onChange={(
                  event
                ) => {
                  setEmail(
                    event.target.value
                  );

                  setMessage(
                    ""
                  );
                }}
                autoComplete="email"
                disabled={
                  isLoading ||
                  isResetLoading
                }
              />
            </div>

            <div className="login-field login-password">
              <label htmlFor="login-password">
                {t("passwordLabel")}
              </label>

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder={t("passwordPlaceholder")}
                value={
                  password
                }
                onChange={(
                  event
                ) => {
                  setPassword(
                    event.target.value
                  );

                  setMessage(
                    ""
                  );
                }}
                autoComplete="current-password"
                disabled={
                  isLoading ||
                  isResetLoading
                }
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (
                      previous
                    ) =>
                      !previous
                  )
                }
                disabled={
                  isLoading ||
                  isResetLoading
                }
              >
                {showPassword
                  ? t("hidePassword")
                  : t("showPassword")}
              </button>
            </div>

            {/* CAPTCHA */}

            <div
              style={{
                marginTop:
                  "4px",
                marginBottom:
                  "8px",
              }}
            >
              <span className="login-card__eyebrow">
                {t("securityEyebrow")}
              </span>

              <div
                ref={
                  turnstileContainerRef
                }
                style={{
                  width:
                    "100%",
                  marginTop:
                    "12px",
                }}
              />

              {captchaReady && (
                <p
                  style={{
                    color:
                      "#4ade80",
                    fontSize:
                      "0.8rem",
                    margin:
                      "10px 0 0",
                  }}
                >
                  ✓ {t("securityValidated")}
                </p>
              )}

              {captchaError && (
                <p
                  className="login-form-message"
                  style={{
                    marginTop:
                      "10px",
                  }}
                >
                  {
                    captchaError
                  }
                </p>
              )}
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    event
                  ) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={
                    isLoading ||
                    isResetLoading
                  }
                />

                {t("rememberMe")}
              </label>

              <button
                type="button"
                className="login-forgot"
                onClick={
                  handleForgotPassword
                }
                disabled={
                  isLoading ||
                  isResetLoading ||
                  !captchaToken
                }
              >
                {isResetLoading
                  ? t("sending")
                  : t("forgotPassword")}
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={
                isLoading ||
                isResetLoading ||
                !captchaToken
              }
            >
              {isLoading
                ? t("signingIn")
                : captchaToken
                  ? t("signIn")
                  : t("validateSecurity")}
            </button>

            {message && (
              <p
                className="login-form-message"
                role="status"
              >
                {message}
              </p>
            )}
          </form>

          <div className="login-divider">
            <span>
              {t("or")}
            </span>
          </div>

          <div className="login-account">
            <p>
              {t("noAccount")}
            </p>

            <a
              href="/register"
              className="login-create"
            >
              {t("createAccount")}
            </a>
          </div>

          <p className="login-security">
            {t("secureConnection")}
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
