// الصور المتوفرة حاليًا 4 فقط، فبتتكرر على الخدمات الباقية لحد ما تنضاف صور جديدة
const IMG = {
    painting: "/images/Rectangle 39574.svg",
    building: "/images/Rectangle 39574 (1).svg",
    carpentry: "/images/Rectangle 39574 (2).svg",
    cleaning: "/images/Rectangle 39574 (3).svg",
};

export const SERVICES = [
    { key: "painting", image: IMG.painting },
    { key: "cleaning", image: IMG.cleaning },
    { key: "building", image: IMG.building },
    { key: "carpentry", image: IMG.carpentry },
    { key: "electricity", image: IMG.building },
    { key: "plumbing", image: IMG.cleaning },
    { key: "acMaintenance", image: IMG.carpentry },
    { key: "tiling", image: IMG.painting },
    { key: "gardening", image: IMG.building },
    { key: "moving", image: IMG.cleaning },
];
