export const dictionaries = {
  en: {
    hero: {
      badge: "Intentional Parenting Excellence",
      title1: "Raise The",
      title2: "Next Generation",
      subtitle: "Transformative courses and a supportive community designed to help you parent with purpose, grace, and an unwavering grind.",
      ctaPrimary: "Start Learning",
      ctaSecondary: "Explore Programs"
    },
    nav: {
      programs: "Programs",
      about: "About",
      ceo: "CEO Hub",
      educator: "Educator",
      admin: "Admin",
      login: "Login",
      signout: "Sign Out"
    }
  },
  am: {
    hero: {
      badge: "የታለመ የልጅ አስተዳደግ ብቃት",
      title1: "ቀጣዩን ትውልድ",
      title2: "በብቃት ያሳድጉ",
      subtitle: "በታለመ ዓላማ፣ በጸጋ እና በማያቋርጥ ጥረት ልጆችዎን እንዲያሳድጉ የሚረዱ ተለዋዋጭ ኮርሶች እና አጋዥ ማህበረሰብ።",
      ctaPrimary: "መማር ይጀምሩ",
      ctaSecondary: "ፕሮግራሞችን ያስሱ"
    },
    nav: {
      programs: "ፕሮግራሞች",
      about: "ስለ እኛ",
      ceo: "ዋና አስተዳደር",
      educator: "አስተማሪ",
      admin: "አስተዳደር",
      login: "ግባ",
      signout: "ውጣ"
    }
  }
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof dictionaries.en;
