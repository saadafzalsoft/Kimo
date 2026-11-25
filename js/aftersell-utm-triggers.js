var u = Object.defineProperty;
var m = (e, t, o) => t in e ? u(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o;
var i = (e, t, o) => m(e, typeof t != "symbol" ? t + "" : t, o);
class c {
  static get() {
    let t = null;
    try {
      t = JSON.parse(
        sessionStorage.getItem(this.SESSION_STORAGE_KEY) || "null"
      );
    } catch {
    }
    return t;
  }
  static set(t) {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(t));
    } catch {
    }
  }
}
// we set this as a class property to avoid declaring constants in global scopr
i(c, "SESSION_STORAGE_KEY", "as-customer-trigger-data");
function S({
  urlSearchParams: e,
  existingCustomerData: t
}) {
  const o = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_id",
    "utm_content"
  ];
  let r = !1;
  const n = {};
  for (const a of o) {
    const s = e.get(a) || (t == null ? void 0 : t[a]);
    s && (r = !0, n[a] = s);
  }
  return r ? n : null;
}
const g = "https://start.aftersell.app";
function l({ cookie: e, cookieName: t }) {
  const o = new RegExp(`^${t}=`), r = e.split(";").map((s) => s.trim()).find((s) => o.test(s));
  if (!r) return null;
  const n = r.replace(`${t}=`, "");
  let a;
  try {
    a = decodeURIComponent(n);
  } catch {
    a = n;
  }
  return a.split("?")[0];
}
function p({
  cookieName: e,
  onChange: t,
  callbackOnInitialValue: o
}) {
  let n = l({ cookie: document.cookie, cookieName: e });
  t(n), setInterval(() => {
    const a = l({ cookie: document.cookie, cookieName: e });
    a !== n && (n = a, t(a));
  }, 500);
}
p({
  cookieName: "cart",
  callbackOnInitialValue: !0,
  onChange: (e) => {
    const t = c.get(), o = S({
      urlSearchParams: new URLSearchParams(window.location.search),
      existingCustomerData: t
    });
    c.set(o), !(typeof e != "string" || !e || !o) && fetch(`${g}/api/v1/storefrontSessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ shop: window.Shopify.shop, cartToken: e, customerTriggerData: o })
    });
  }
});
