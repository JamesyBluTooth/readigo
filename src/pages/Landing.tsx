import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();

const goToLogin = () => {
  navigate("/?isLoggingIn=true");
};

const goToSignup = () => {
  setTimeout(() => {
    navigate("/?isSigningUp=true");
  }, 150);
};

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#3c3c3c]">
      {/* HEADER */}
      <header className="bg-[#517efe] shadow-[0_4px_0_#4971e5]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-white">
          <div className="text-xl font-extrabold tracking-wide">
            Readigo
          </div>

          <nav className="flex items-center gap-3">

            <button
              onClick={goToLogin}
              className="px-8 py-2 text-sm font-bold rounded-xl bg-white text-[#3c3c3c] border border-gray-200"
            >
              Log in
            </button>

            <button 
  onClick={goToSignup} 
  className="px-12 py-2 text-sm font-bold border-2 border-solid border-[#4971e5] rounded-xl bg-[#517efe] text-white shadow-[0_6px_0_#4971e5] active:translate-y-[3px] active:shadow-[0_2px_0_#4971e5]"
>
  Create Account
</button>
          </nav>
        </div>
      </header>

      {/* PAGE */}
      <main className="max-w-xl md:max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* HERO */}
        <section className="bg-white rounded-3xl p-6 shadow-[0_6px_0_#e5e7eb]">
          <h1 className="text-2xl font-bold mb-2">
            Reading, made delightfully social.
          </h1>

          <p className="text-gray-600 leading-relaxed">
            Track your reading, build better habits, and enjoy books with friends —
            without the noise of social media.
          </p>

          <div className="mt-5 flex flex-col md:flex-row gap-3">
            <button
              onClick={goToSignup}
              className="flex-1 px-4 py-3 font-bold rounded-2xl bg-[#517efe] text-white shadow-[0_6px_0_#4971e5] active:translate-y-[3px] active:shadow-[0_2px_0_#4971e5]"
            >
              Create an account
            </button>

            <button
              onClick={goToLogin}
              className="flex-1 px-4 py-3 font-bold rounded-2xl border border-gray-200 bg-white"
            >
              Log in
            </button>
          </div>

          <div className="mt-3 text-center text-xs text-gray-500">
            Free. No ads. No shouting.
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            How it works
          </h2>

          {[
            {
              icon: "📚",
              title: "Add your books",
              desc: "Search by ISBN or add them manually in seconds.",
            },
            {
              icon: "📈",
              title: "Track your reading",
              desc: "Log pages, time, and thoughts as you go.",
            },
            {
              icon: "👥",
              title: "Read together",
              desc: "Follow friends, join challenges, stay motivated.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-3xl p-5 flex gap-4 items-center shadow-[0_6px_0_#e5e7eb]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#e9ecff] flex items-center justify-center text-2xl flex-shrink-0">
                {step.icon}
              </div>

              <div>
                <strong className="block font-semibold">
                  {step.title}
                </strong>
                <p className="text-sm text-gray-600 mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* OVERVIEW STRIP */}
        <section className="rounded-3xl border-2 border-gray-200 bg-gradient-to-b from-[#f2f5ff] to-white p-5 shadow-[0_6px_0_#e5e7eb]">
          <div className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-3">
            Why Readigo?
          </div>

          <div className="flex gap-3">
            {[
              { icon: "📊", label: "Smart analytics" },
              { icon: "🏆", label: "Motivating goals" },
              { icon: "🤝", label: "Social, not noisy" },
            ].map((item) => (
              <div key={item.label} className="flex-1 text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <span className="text-xs text-gray-600">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-white rounded-3xl p-6 text-center shadow-[0_6px_0_#e5e7eb]">
          <strong className="block text-lg mb-4">
            Ready to turn reading into a habit?
          </strong>

          <button
            onClick={goToSignup}
            className="px-6 py-3 font-bold rounded-2xl bg-[#517efe] text-white shadow-[0_6px_0_#4971e5] active:translate-y-[3px] active:shadow-[0_2px_0_#4971e5]"
          >
            Create an account
          </button>
        </section>
      </main>
    </div>
  );
};
