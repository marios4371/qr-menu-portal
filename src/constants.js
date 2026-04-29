// src/constants.js
// Static data: plans, services, feature flags, etc.

export const SERVICES = [
  { title: "Ψηφιακό Μενού QR", desc: "Σάρωση QR — το μενού εμφανίζεται αμέσως στο κινητό. Χωρίς app, χωρίς εγγραφή πελάτη." },
  { title: "Real-time Παραγγελίες", desc: "Κάθε παραγγελία φτάνει στον σωστό σταθμό — Bar ή Kitchen — σε δευτερόλεπτα." },
  { title: "Staff Dashboard", desc: "Web-based dashboard για σερβιτόρους, αναλήψεις τραπεζιών και πληρωμές." },
  { title: "Σύστημα Κρατήσεων", desc: "Διαχείριση κρατήσεων απευθείας από το portal. Διαθέσιμο στο Premium πλάνο." },
  { title: "Analytics & Αναφορές", desc: "Στατιστικά παραγγελιών, κορυφαία προϊόντα, έσοδα ανά μήνα. Exclusive πλάνο." },
  { title: "Διαχείριση Κάβας", desc: "Αποθεματολόγιο και μαζικές παραγγελίες προς προμηθευτές με export αρχείου." },
];

export const PLANS = [
  {
    value: "STANDARD", name: "Standard", price: "12,00", period: "€ / μήνα",
    features: ["1 κατάστημα", "Universal digital menu", "Επεξεργασία μενού", "URL: /menu/{slug}", "Email support"],
    cta: "Ξεκινήστε", highlight: false,
  },
  {
    value: "PREMIUM", name: "Premium", price: "16,70", period: "€ / μήνα",
    features: ["Όλα του Standard", "Gallery templates", "Προσαρμογή εμφάνισης", "Φωτογραφίες προϊόντων", "Παραγγελιοληψία (toggle)", "Πίνακες παραγγελιών", "Κρατήσεις"],
    cta: "Επιλέξτε Premium", highlight: true,
  },
  {
    value: "EXCLUSIVE", name: "Exclusive", price: "25,00", period: "€ / μήνα",
    features: ["Όλα του Premium", "Business analytics", "Κάβα & απόθεμα", "Μαζικές παραγγελίες", "Export CSV", "Dedicated support"],
    cta: "Επιλέξτε Exclusive", highlight: false,
  },
];

export const PLAN_FEATURES = {
  STANDARD: [
    { key: "digitalMenu",    label: "Ψηφιακό Μενού",   desc: "QR menu για τους πελάτες σας" },
    { key: "globalTemplate", label: "Global Template",  desc: "Ένα έτοιμο template για το μενού" },
  ],
  PREMIUM: [
    { key: "digitalMenu",        label: "Ψηφιακό Μενού",        desc: "QR menu για τους πελάτες σας" },
    { key: "globalTemplate",     label: "Global Template",       desc: "Ένα έτοιμο template για το μενού" },
    { key: "templateGallery",    label: "Template Gallery",      desc: "Επιλογή από πολλά έτοιμα templates" },
    { key: "themeCustomization", label: "Προσαρμογή Εμφάνισης", desc: "Γραμματοσειρές, χρώματα, borders, φωτογραφίες" },
    { key: "customerOrdering",   label: "Παραγγελιοληψία",      desc: "On/off κουμπί παραγγελίας στο μενού" },
    { key: "orderAnalytics",     label: "Αναλυτική Παραγγελιών", desc: "Πίνακες παραγγελιών ανά μήνα" },
    { key: "reservations",       label: "Σύστημα Κρατήσεων",    desc: "Online κρατήσεις τραπεζιού" },
  ],
  EXCLUSIVE: [
    { key: "digitalMenu",        label: "Ψηφιακό Μενού",        desc: "QR menu για τους πελάτες σας" },
    { key: "globalTemplate",     label: "Global Template",       desc: "Ένα έτοιμο template" },
    { key: "templateGallery",    label: "Template Gallery",      desc: "Επιλογή από έτοιμα templates" },
    { key: "themeCustomization", label: "Προσαρμογή Εμφάνισης", desc: "Γραμματοσειρές, χρώματα, photos" },
    { key: "customerOrdering",   label: "Παραγγελιοληψία",      desc: "On/off κουμπί παραγγελίας" },
    { key: "orderAnalytics",     label: "Αναλυτική Παραγγελιών", desc: "Πίνακες παραγγελιών ανά μήνα" },
    { key: "reservations",       label: "Σύστημα Κρατήσεων",    desc: "Online κρατήσεις τραπεζιού" },
    { key: "advancedReports",    label: "Αναφορές Επιχείρησης", desc: "Εξειδικευμένη ανάλυση" },
    { key: "inventory",          label: "Κάβα & Αποθήκη",       desc: "Stock management" },
    { key: "supplierExport",     label: "Export Προμηθευτή",    desc: "Αυτόματο αρχείο παραγγελίας" },
  ],
};

export const STATIONS = [
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BAR",     label: "Bar" },
];

export const BUSINESS_TYPES = [
  { value: "RESTAURANT", label: "Εστιατόριο" },
  { value: "CAFE",       label: "Καφέ" },
  { value: "BAR",        label: "Bar" },
];
