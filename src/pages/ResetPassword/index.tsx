import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  FormEvent,
} from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import BrandLogo from "../../components/common/BrandLogo";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { resetPasswordTranslations } from "../../i18n/locales/resetPassword";



const pageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "34px 18px",
};

const layoutStyle: CSSProperties = {
  width: "100%",
  maxWidth: "980px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
  alignItems: "center",
};

const introStyle: CSSProperties = {
  width: "100%",
  maxWidth: "430px",
  margin: "0 auto",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "500px",
  margin: "0 auto",
  padding: "28px",
  boxSizing: "border-box",
};

const fieldWrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
};

const inputStyle = (
  visible: boolean
): CSSProperties & {
  WebkitTextSecurity?: "none" | "disc";
} => ({
  width: "100%",
  minHeight: "50px",
  padding: "0 52px 0 14px",
  boxSizing: "border-box",
  fontSize: "1rem",
  lineHeight: 1.2,
  letterSpacing: visible
    ? "0.02em"
    : "0.08em",
  WebkitTextSecurity: visible
    ? "none"
    : "disc",
});

const eyeButtonStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  right: "12px",
  transform: "translateY(-50%)",
  width: "36px",
  height: "36px",
  display: "grid",
  placeItems: "center",
  padding: 0,
  margin: 0,
  border: "none",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  cursor: "pointer",
  zIndex: 3,
};

function ResetPassword() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      resetPasswordTranslations,
      locale,
      `resetPassword.${key}`
    );

  const initialRecoveryRef = useRef(
    window.location.hash.includes(
      "type=recovery"
    ) ||
      window.location.search.includes(
        "type=recovery"
      )
  );

  const [checking, setChecking] =
    useState(true);

  const [
    recoveryReady,
    setRecoveryReady,
  ] = useState(false);

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const hashParams =
      new URLSearchParams(
        window.location.hash.replace(
          /^#/,
          ""
        )
      );

    const searchParams =
      new URLSearchParams(
        window.location.search
      );

    const hasAuthError =
      hashParams.has("error") ||
      searchParams.has("error");

    if (hasAuthError) {
      setChecking(false);
      setRecoveryReady(false);
      return;
    }

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) {
            return;
          }

          if (
            event ===
              "PASSWORD_RECOVERY" &&
            session
          ) {
            initialRecoveryRef.current =
              true;
            setRecoveryReady(true);
            setChecking(false);
            return;
          }

          if (
            initialRecoveryRef.current &&
            session
          ) {
            setRecoveryReady(true);
            setChecking(false);
          }
        }
      );

    const checkSession = async () => {
      for (
        let attempt = 0;
        attempt < 12;
        attempt += 1
      ) {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (
          session &&
          initialRecoveryRef.current
        ) {
          setRecoveryReady(true);
          setChecking(false);
          return;
        }

        await new Promise(
          (resolve) => {
            window.setTimeout(
              resolve,
              250
            );
          }
        );
      }

      if (mounted) {
        setRecoveryReady(false);
        setChecking(false);
      }
    };

    void checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setMessage("");
    setSuccess(false);

    if (
      !password ||
      !confirmPassword
    ) {
      setMessage(t("required"));
      return;
    }

    if (password.length < 8) {
      setMessage(t("tooShort"));
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setMessage(t("mismatch"));
      return;
    }

    setSubmitting(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      console.error(
        "Erreur changement mot de passe :",
        error
      );

      setMessage(t("genericError"));
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setMessage(t("success"));
    setSubmitting(false);

    await supabase.auth.signOut();

    window.setTimeout(() => {
      window.location.href =
        "/login";
    }, 1600);
  };

  return (
    <main
      className="login-page"
      style={pageStyle}
    >
      <div style={layoutStyle}>
        <section
          className="login-page__intro"
          style={introStyle}
        >
          <BrandLogo />

          <span className="login-eyebrow">
            {t("eyebrow")}
          </span>

          <h1
            className="login-title"
            style={{
              fontSize:
                "clamp(2rem, 4vw, 3.2rem)",
              lineHeight: 1.04,
            }}
          >
            {t("title")}
          </h1>

          <p className="login-subtitle">
            {t("subtitle")}
          </p>

          <div className="login-security-note">
            <ShieldCheck
              size={18}
              aria-hidden="true"
            />
            {t("secure")}
          </div>
        </section>

        <section
          className="login-card"
          style={cardStyle}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              display: "grid",
              placeItems: "center",
              borderRadius: "15px",
              marginBottom: "16px",
              background:
                "rgba(14,165,233,0.12)",
              border:
                "1px solid rgba(56,189,248,0.28)",
            }}
          >
            <KeyRound
              size={24}
              aria-hidden="true"
            />
          </div>

          <span className="login-card__eyebrow">
            {t("cardEyebrow")}
          </span>

          <h2
            style={{
              fontSize:
                "clamp(1.65rem, 3vw, 2.15rem)",
              marginBottom: "18px",
            }}
          >
            {t("cardTitle")}
          </h2>

          {checking && (
            <p className="login-form-message">
              {t("checking")}
            </p>
          )}

          {!checking &&
            !recoveryReady && (
              <>
                <p className="login-form-message">
                  {t("invalid")}
                </p>

                <a
                  href="/login"
                  className="login-submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    textDecoration:
                      "none",
                    marginTop: "18px",
                  }}
                >
                  {t("requestNew")}
                </a>

                <a
                  href="/login"
                  className="login-create"
                  style={{
                    marginTop: "12px",
                    textDecoration:
                      "none",
                  }}
                >
                  {t("backLogin")}
                </a>
              </>
            )}

          {!checking &&
            recoveryReady && (
              <form
                onSubmit={
                  handleSubmit
                }
                className="login-form"
                style={{
                  gap: "14px",
                }}
              >
                <label className="login-field">
                  <span>
                    {t("newPassword")}
                  </span>

                  <div
                    style={
                      fieldWrapStyle
                    }
                  >
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                      style={inputStyle(
                        showPassword
                      )}
                    />

                    <button
                      type="button"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      style={
                        eyeButtonStyle
                      }
                      aria-label={
                        showPassword
                          ? t("hide")
                          : t("show")
                      }
                      title={
                        showPassword
                          ? t("hide")
                          : t("show")
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>
                </label>

                <label className="login-field">
                  <span>
                    {t("confirmPassword")}
                  </span>

                  <div
                    style={
                      fieldWrapStyle
                    }
                  >
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setConfirmPassword(
                          event.target
                            .value
                        )
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                      style={inputStyle(
                        showConfirmPassword
                      )}
                    />

                    <button
                      type="button"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      style={
                        eyeButtonStyle
                      }
                      aria-label={
                        showConfirmPassword
                          ? t("hide")
                          : t("show")
                      }
                      title={
                        showConfirmPassword
                          ? t("hide")
                          : t("show")
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>
                </label>

                <p
                  style={{
                    margin:
                      "-2px 0 2px",
                    color:
                      "rgba(255,255,255,0.55)",
                    fontSize:
                      "0.82rem",
                  }}
                >
                  {t("minPassword")}
                </p>

                {message && (
                  <p
                    className="login-form-message"
                    style={
                      success
                        ? {
                            color:
                              "#4ade80",
                          }
                        : undefined
                    }
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="login-submit"
                  disabled={
                    submitting ||
                    success
                  }
                  style={{
                    minHeight:
                      "48px",
                  }}
                >
                  {submitting
                    ? t("updating")
                    : t("submit")}
                </button>
              </form>
            )}
        </section>
      </div>
    </main>
  );
}

























































































export default ResetPassword;
