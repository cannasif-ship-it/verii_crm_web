# Müşteri Seç Ekranı – Mobil (Expo / React Native) Uygulama Prompt'u

Web'deki **Müşteri Seç** (CustomerSelectDialog) davranışının mobilde birebir karşılığı olacak bir **Müşteri Seç** ekranı yap. Tek veri kaynağı, üç sekme, aynı filtre ve seçim mantığı kullanılacak.

---

## Veri kaynağı

- **Tek API:** CRM Müşteri Listesi (sayfalı liste endpoint'i). ERP için ayrı endpoint yok.
- Tüm sekmeler bu API'den dönen aynı listeyi kullanır; sadece istemci tarafında filtre uygulanır.

---

## ERP / Potansiyel ayrımı (tip hesabı)

Her müşteri kaydı için tip şöyle belirlenir:

- **ERP:** `isIntegrated === true` **veya** `customerCode` dolu (null/undefined değil, trim sonrası `''` değil).
- **Potansiyel:** Yukarıdakilerin dışındakiler (yani `isIntegrated` true değil ve `customerCode` boş/null).

Bu mantık listedeki her item için bir kere hesaplanır; her item'a `type: 'erp' | 'potential'` (veya eşdeğeri) eklenir.

---

## Sekmeler (Tab'lar)

1. **ERP**
   - Sadece tipi ERP olan müşteriler listelenir.
   - Boşsa: "ERP müşterisi bulunamadı" (veya çeviri anahtarı) göster.

2. **Potansiyel**
   - Sadece tipi Potansiyel olan müşteriler listelenir.
   - Boşsa: "Potansiyel müşteri bulunamadı" göster.

3. **Tümü**
   - Tüm müşteriler (ERP + Potansiyel) listelenir.
   - Boşsa: "Müşteri bulunamadı" göster.

Sekme değişince sadece hangi tipin gösterileceği değişir; API tekrar çağrılmaz (aynı liste cache'ten filtrelenir).

---

## Ortak davranış

- **Arama:** Tek arama alanı; isim veya müşteri kodu ile filtreleme. Arama metni tüm sekmelerde geçerli (listeyi filtreler).
- **Görünüm:** İsteğe bağlı liste / kart görünümü; seçim üç sekme için de aynı.
- **Seçim:** Kullanıcı bir satıra/karta tıkladığında dönecek obje:
  - `customerId` (number, zorunlu),
  - `erpCustomerCode` (string | undefined – sadece ERP ve customerCode doluysa),
  - `customerName` (string).
- Seçim sonrası ekran kapanır ve bu obje parent'a (callback / navigation param vb.) iletilir.

---

## Liste item'ında gösterilecekler

- Tip etiketi: **ERP** (mor/violet) veya **CRM/Potansiyel** (pembe/pink).
- Müşteri adı.
- Varsa müşteri kodu (ERP'lerde).
- İsteğe bağlı: telefon, e-posta, şehir/ilçe.

---

## Teknik notlar (Expo / React Native)

- Liste için FlatList (veya benzeri) kullan; uzun listelerde performans için.
- Sekme için React Native'de Tab/Top Tabs (örn. react-native-tab-view veya basit state ile 3 buton) kullanılabilir.
- API'den gelen listeyi bir state/context'te tut; sekmeye ve arama metnine göre `useMemo` veya benzeri ile filtrelenmiş listeler türet.
- Çeviriler için i18n (örn. expo-localization + JSON) kullan; metinleri sabit yazma.

Bu prompt'u mobil geliştiriciye vererek web'deki Müşteri Seç mantığının Expo/React Native'de aynı şekilde uygulanmasını sağlayabilirsin.
