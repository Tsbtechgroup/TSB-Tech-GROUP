import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import BrandLogo from "../../components/common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { registerTranslations } from "../../i18n/locales/register";
import { supabase } from "../../services/supabase";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

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

const getTurnstileApi = () =>
  (
    window as Window & {
      turnstile?: TurnstileApi;
    }
  ).turnstile;

const TURNSTILE_SCRIPT_ID =
  "tsb-turnstile-script";

const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function Register() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      registerTranslations,
      locale,
      `register.${key}`
    );

  const preferredLanguage = locale;

  const turnstileLanguage =
    locale === "zh"
      ? "zh-cn"
      : locale;

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<FieldErrors>({});

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    captchaToken,
    setCaptchaToken,
  ] = useState<string | null>(
    null
  );

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
    useRef<string | null>(null);

  const turnstileSiteKey =
    import.meta.env
      .VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    let active = true;

    const renderTurnstile =
      () => {
        const turnstile =
          getTurnstileApi();

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

                theme: "dark",

                language:
                  turnstileLanguage,

                size: "flexible",

                callback: (
                  token
                ) => {
                  setCaptchaToken(
                    token
                  );

                  setCaptchaError(
                    ""
                  );

                  setCaptchaReady(
                    true
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
                      t("captchaExpired")
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
                      t("captchaValidationFailed")
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
            t("captchaLoadFailed")
          );
        }
      };

    if (!turnstileSiteKey) {
      setCaptchaError(
        t("captchaConfigMissing")
      );

      return;
    }

    if (getTurnstileApi()) {
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
          getTurnstileApi();

        if (
          turnstileWidgetIdRef.current &&
          turnstile
        ) {
          try {
            turnstile.remove(
              turnstileWidgetIdRef.current
            );
          } catch {
            // Rien à faire
          }

          turnstileWidgetIdRef.current =
            null;
        }
      };
    }

    return () => {
      active = false;

      const turnstile =
        getTurnstileApi();

      if (
        turnstileWidgetIdRef.current &&
        turnstile
      ) {
        try {
          turnstile.remove(
            turnstileWidgetIdRef.current
          );
        } catch {
          // Rien à faire
        }

        turnstileWidgetIdRef.current =
          null;
      }
    };
  }, [
    locale,
    turnstileSiteKey,
  ]);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaReady(false);

    const turnstile =
      getTurnstileApi();

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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setMessage("");

    setFieldErrors(
      (previous) => ({
        ...previous,
        [name]: undefined,
      })
    );
  };

  const validateForm = () => {
    const errors: FieldErrors =
      {};

    if (
      !formData.firstName.trim()
    ) {
      errors.firstName =
        t("required");
    }

    if (
      !formData.lastName.trim()
    ) {
      errors.lastName =
        t("required");
    }

    if (
      !formData.email.trim()
    ) {
      errors.email =
        t("required");
    }

    if (
      !formData.phone.trim()
    ) {
      errors.phone =
        t("required");
    }

    if (
      !formData.password.trim()
    ) {
      errors.password =
        t("required");
    } else if (
      formData.password.length <
      8
    ) {
      errors.password =
        t("passwordMin");
    }

    if (
      !formData.confirmPassword.trim()
    ) {
      errors.confirmPassword =
        t("required");
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      errors.confirmPassword =
        t("passwordMismatch");
    }

    setFieldErrors(
      errors
    );

    return (
      Object.keys(errors)
        .length === 0
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const isValid =
      validateForm();

    if (!isValid) {
      setMessage(
        t("formInvalid")
      );

      return;
    }

    if (!captchaToken) {
      setMessage(
        t("captchaRequired")
      );

      return;
    }

    setIsLoading(true);
    setMessage("");

    const {
      data,
      error,
    } =
      await supabase.auth.signUp(
        {
          email:
            formData.email.trim(),

          password:
            formData.password,

          options: {
            captchaToken,

            emailRedirectTo:
              `${window.location.origin}/login`,

            data: {
              first_name:
                formData.firstName.trim(),

              last_name:
                formData.lastName.trim(),

              phone:
                formData.phone.trim(),

              preferred_language:
                preferredLanguage,
            },
          },
        }
      );

    if (
      !error &&
      data.user &&
      data.session
    ) {
      const {
        error:
          profileLanguageError,
      } = await supabase
        .from("profiles")
        .update({
          preferred_language:
            preferredLanguage,
        })
        .eq(
          "id",
          data.user.id
        );

      if (
        profileLanguageError
      ) {
        console.warn(
          "Langue du profil non synchronisée immédiatement :",
          profileLanguageError
        );
      }
    }

    setIsLoading(false);

    /*
      Le token Turnstile ne doit pas
      être réutilisé après une requête.
    */
    resetCaptcha();

    if (error) {
      console.error(
        "Erreur création compte :",
        error
      );

      setMessage(
        t("createAccountError")
      );

      return;
    }

    if (
  data.user &&
  !data.session
) {
  setMessage(
    t("confirmEmail")
  );

  window.setTimeout(() => {
    window.location.href = "/login";
  }, 2000);

  return;
}

    if (data.session) {
      setMessage(
        t("accountCreatedSession")
      );

      return;
    }

    setMessage(
      t("accountCreatedLogin")
    );
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-brand">
          <a
            href="/"
            aria-label={t("backAria")}
          >
            <BrandLogo />
          </a>

          <div className="login-kicker">
            TSB DIGITAL PLATFORM
          </div>

          <h1>
            {t("brandTitle1")}
            <br />
            {t("brandTitle2")}
          </h1>

          <p>
            {t("brandIntro")}
          </p>

          <a
            href="/login"
            className="login-back"
          >
            ← {t("backLogin")}
          </a>
        </section>

        <section className="login-card">
          <span className="login-card__eyebrow">
            REGISTER-001
          </span>

          <h2>
            {t("title")}
          </h2>

          <p className="login-card__intro">
            {t("intro")}
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="quote-form__grid">
              <div className="login-field">
                <label htmlFor="register-first-name">
                  {t("firstName")} *
                </label>

                <input
                  id="register-first-name"
                  type="text"
                  name="firstName"
                  value={
                    formData.firstName
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="given-name"
                  disabled={
                    isLoading
                  }
                  className={
                    fieldErrors.firstName
                      ? "login-input--error"
                      : ""
                  }
                />

                {fieldErrors.firstName && (
                  <span className="login-field-error">
                    {
                      fieldErrors.firstName
                    }
                  </span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="register-last-name">
                  {t("lastName")} *
                </label>

                <input
                  id="register-last-name"
                  type="text"
                  name="lastName"
                  value={
                    formData.lastName
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="family-name"
                  disabled={
                    isLoading
                  }
                  className={
                    fieldErrors.lastName
                      ? "login-input--error"
                      : ""
                  }
                />

                {fieldErrors.lastName && (
                  <span className="login-field-error">
                    {
                      fieldErrors.lastName
                    }
                  </span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="register-email">
                  {t("email")} *
                </label>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="email"
                  disabled={
                    isLoading
                  }
                  className={
                    fieldErrors.email
                      ? "login-input--error"
                      : ""
                  }
                />

                {fieldErrors.email && (
                  <span className="login-field-error">
                    {
                      fieldErrors.email
                    }
                  </span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="register-phone">
                  {t("phone")} *
                </label>

                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="tel"
                  disabled={
                    isLoading
                  }
                  className={
                    fieldErrors.phone
                      ? "login-input--error"
                      : ""
                  }
                />

                {fieldErrors.phone && (
                  <span className="login-field-error">
                    {
                      fieldErrors.phone
                    }
                  </span>
                )}
              </div>
            </div>

            <div className="login-field login-password">
              <label htmlFor="register-password">
                {t("password")} *
              </label>

              <input
                id="register-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                autoComplete="new-password"
                disabled={
                  isLoading
                }
                className={
                  fieldErrors.password
                    ? "login-input--error"
                    : ""
                }
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                disabled={
                  isLoading
                }
              >
                {showPassword
                  ? t("hidePassword")
                  : t("showPassword")}
              </button>

              {fieldErrors.password && (
                <span className="login-field-error">
                  {
                    fieldErrors.password
                  }
                </span>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="register-confirm-password">
                {t("confirmPassword")} *
              </label>

              <input
                id="register-confirm-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
                autoComplete="new-password"
                disabled={
                  isLoading
                }
                className={
                  fieldErrors.confirmPassword
                    ? "login-input--error"
                    : ""
                }
              />

              {fieldErrors.confirmPassword && (
                <span className="login-field-error">
                  {
                    fieldErrors.confirmPassword
                  }
                </span>
              )}
            </div>

            {/* CLOUDFLARE TURNSTILE */}

            <div
              style={{
                marginTop: "6px",
                marginBottom: "6px",
              }}
            >
              <span className="login-card__eyebrow">
                {t("securityCheck")}
              </span>

              <div
                ref={
                  turnstileContainerRef
                }
                style={{
                  marginTop: "12px",
                  width: "100%",
                }}
              />

              {captchaReady && (
                <p
                  style={{
                    color: "#4ade80",
                    fontSize: "0.8rem",
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
                  {captchaError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={
                isLoading ||
                !captchaToken
              }
            >
              {isLoading
                ? t("creatingAccount")
                : captchaToken
                  ? t("createAccount")
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
            <span>{t("or")}</span>
          </div>

          <div className="login-account">
            <p>
              {t("alreadyAccount")}
            </p>

            <a
              href="/login"
              className="login-create"
            >
              {t("login")}
            </a>
          </div>

          <p className="login-security">
            {t("secureRegistration")}
          </p>
        </section>
      </div>
    </main>
  );
}




























































































export default Register;
