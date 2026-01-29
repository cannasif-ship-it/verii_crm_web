# Quotation Create – Cursor Mobile (Expo) Uygulama Promptu

Bu belge, **/quotations/create** sayfasının React Native (Expo) karşılığını yazmak için kullanılacak, **adım adım ve eksiksiz** bir prompttur.

**Sıfırdan uygulama:** Bu dosya **tek başına** yeterlidir. Başka kaynak veya kod tabanına bakmadan, yalnızca bu prompttan hareketle tüm API istekleri, endpoint’ler, **tam DTO tanımları** (her alan, tip, nullability), validasyonlar, kontroller, UI kuralları (dropdown, search, sesli komut) ve hesaplama mantığı implemente edilebilir.

---

## 1. Sayfa Özeti

- **Ekran:** Yeni Teklif Oluştur (Quotation Create).
- **Amaç:** Müşteri seçimi, satış temsilcisi, para birimi, ödeme tipi, tarihler, isteğe bağlı kurlar ve teklif satırları (ürün + miktar + fiyat + indirimler + KDV) ile teklif oluşturup `POST /api/quotation/bulk-quotation` ile göndermek.
- **Mimari:** Screen sadece UI; tüm API ve business logic hook’larda. Liste render için **FlatList** kullan; `map` ile liste render **yasak**. Sayfalı listelerde pagination **scroll tabanlı**dır (infinite scroll; **§2.5**).

### 1.1. Sayfa akışı (özet)

1. **Açılış:** Header için API’ler (related-users, payment types, exchange rates, CRM/ERP customers). Form varsayılanları (offerType, offerDate, representativeId).
2. **Müşteri seçilince:** CRM → customer detail, sevk adresleri; ERP → sadece cari. Seri no, fiyat kuralları, indirim limitleri temsilci + müşteri tipi + tarih ile çekilir.
3. **Satır ekle:** Ön kontrol (§8.7) → boş satır formu veya ürün seçici → ürün/fiyat (price-of-product, gerekirse Stock) → satır kaydet. Bağlı stok varsa çoklu satır (§8.10).
4. **Kurlar:** Opsiyonel; “Kurlar” ile dialog aç → ERP kurları + mevcut `exchangeRates` birleştir → Kaydet ve Uygula.
5. **Para birimi değişince:** Satır varsa onay dialogu (§8.5) → onayda fiyatlar yeni paraya çevrilir.
6. **Submit:** Validasyonlar (§8.2) → body oluştur (§3.7) → `POST bulk-quotation`. **Kaydet sonrası – sonraki adım:** Başarıda teklif detay sayfasına yönlendir; hata durumunda create’te kal, form korunur. Ayrıntı **§3.8**.
7. **Geri / İptal:** `navigate(-1)`.

---

## 2. UI Kuralları: Dropdown, Search, Sesli Komut

Aşağıdaki kurallar **zorunludur**. Tüm seçim alanları dropdown’dur; her birinde arama ve sesli komut desteği bulunur.

### 2.1. Dropdown

- **Müşteri** (CRM / ERP), **Satış temsilcisi**, **Sevk adresi**, **Para birimi**, **Ödeme planı**, **Teklif tipi**, **Seri no** ve **Ürün** seçimleri **dropdown** tipindedir.
- Açıldığında seçenekler liste halinde (örn. FlatList) gösterilir. Liste sayfalıysa **scroll tabanlı pagination** (**§2.5**) uygulanır; aşağı kaydırınca devamı yüklenir.
- Seçim yapılınca dropdown kapanır, seçilen öğe tek satırda (value/label) gösterilir.

### 2.2. Search (Arama)

- Her dropdown’da bir **search (arama)** alanı vardır.
- Kullanıcı bu alana yazarak listeyi **gerçek zamanlı** filtreler.
- Arama, ilgili DTO’nun **gösterimde kullanılan** alanlarına göre yapılır (örn. müşteri için `name` / `customerCode` / `cariKod` / `cariIsim`, temsilci için `firstName` + `lastName`, ürün için `stockName` / `erpStockCode`).
- Search alanı, dropdown açıldığında listenin üstünde veya dropdown’un bir parçası olarak yer alır.

### 2.3. Sesli Komut (Voice)

- **Search kısmı**, **sesli komut** ile de doldurulabilir.
- Kullanıcı sesli arama başlattığında (örn. mikrofona basarak), **speech-to-text** ile konuşma metne çevrilir ve bu metin **doğrudan search alanına** yazılır.
- Böylece liste, sesle söylenen ifadeye göre filtrelenir; kullanıcı ardından listeden seçim yapar.
- Sesli komut yalnızca “search alanını doldurmak” için kullanılır; seçim yine kullanıcı tarafından manuel yapılır.

### 2.4. Özet

- **Dropdown:** Tüm seçim alanları dropdown.
- **Search:** Her dropdown’da arama alanı; yazıyla filtreleme.
- **Sesli komut:** Arama metnini sesle girme (speech-to-text → search alanı); liste buna göre filtrelenir.

Bu kurallar, hem header’daki (müşteri, temsilci, sevk adresi, para birimi, ödeme tipi, teklif tipi, seri no) hem de satır eklerken kullanılan **ürün** dropdown’u için geçerlidir.

### 2.5. Liste ve Pagination (Scroll)

Tüm sayfalı (paged) listelerde pagination **scroll tabanlı**dır; sayfa numarası / “Sonraki sayfa” butonu **kullanılmaz**.

- **Infinite scroll:** Liste (FlatList) aşağı kaydırıldıkça **sonraki sayfa** yüklenir. Kullanıcı en alta yaklaşınca (`onEndReached`) bir sonraki `pageNumber` (veya `page`) ile istek atılır, gelen `data`/`items` mevcut listeye **eklenir**.
- **FlatList:** `data` = biriken liste (önceki sayfalar + yeni yüklenen). `renderItem` ile satır component’i; `keyExtractor` unique key. `map` ile liste render **yasak**. `onEndReachedThreshold` (örn. 0.2–0.5) ile tetikleme erken yapılabilir.
- **Koşullar:** `hasNextPage === true` iken `onEndReached` tetiklenir. Yükleme sırasında (`isFetchingNextPage` vb.) tekrarlı istek engellenir. İsteğe `pageNumber` / `pageSize` (veya `page` / `pageSize`) gönderilir.
- **Loading:** Sonraki sayfa çekilirken liste altında **loading göstergesi** (örn. `ListFooterComponent` ile `ActivityIndicator`) gösterilir.
- **Liste tipi:** Hem **sayfa içi** listeler (örn. teklif satırları) hem de **dropdown/modal** içindeki listeler (müşteri, ürün, vb.) sayfalıysa aynı scroll mantığı uygulanır. Dropdown açıldığında ilk sayfa çekilir; kullanıcı liste içinde aşağı kaydırdıkça devamı yüklenir.
- **Özet:** Pagination = **scroll** (infinite scroll). Sayfa butonu yok. FlatList + `onEndReached` + `hasNextPage` + biriken `data`.

---

## 3. API İstekleri (Adım Adım)

Aşağıdaki istekler sayfa açıldığında veya ilgili bağımlılıklar değiştiğinde atılır. Her biri TanStack Query ile hook içinde sarılacak; **staleTime** isteğe özel verilecek, global default kullanılmayacak.

### 3.1. Sayfa Açılışında / Header İçin

| # | Amaç | HTTP | Endpoint | Query / Not | Dönen |
|---|------|------|----------|-------------|--------|
| 1 | Satış temsilcisi listesi | GET | `/api/Quotation/related-users/{userId}` | `userId` = giriş yapan `user.id` | `ApiResponse<List<ApprovalScopeUserDto>>` |
| 2 | Ödeme tipleri | GET | `/api/PaymentType` | `pageNumber=1`, `pageSize=1000`, `sortBy=Name`, `sortDirection=asc` | `ApiResponse<PagedResponse<PaymentTypeDto>>` |
| 3 | Döviz kurları (para birimi) | GET | `/api/Erp/getExchangeRate` | `tarih=YYYY-MM-DD` (örn. bugün; kurlar dialogunda da aynı), `fiyatTipi=1` | `ApiResponse<KurDto[]>` |
| 4 | CRM müşteri listesi | GET | `/api/Customer` | `pageNumber=1`, `pageSize=1000`, `sortBy=Name`, `sortDirection=asc` | `ApiResponse<PagedResponse<CustomerDto>>` |
| 5 | ERP müşteri listesi | GET | `/api/Erp/getAllCustomers` | Opsiyonel: `cariKodu=...` | `ApiResponse<CariDto[]>` |

### 3.2. Müşteri Seçildikten Sonra

| # | Amaç | HTTP | Endpoint | Koşul | Dönen |
|---|------|------|----------|--------|--------|
| 6 | Müşteri detay | GET | `/api/Customer/{id}` | CRM müşteri seçili | `ApiResponse<CustomerDto>` |
| 7 | Sevk adresleri | GET | `/api/ShippingAddress/customer/{customerId}` | CRM müşteri seçili | `ApiResponse<ShippingAddressDto[]>` |

### 3.3. Temsilci + Müşteri Tipi + Tarih

| # | Amaç | HTTP | Endpoint | Koşul | Dönen |
|---|------|------|----------|--------|--------|
| 8 | Uygun seri tipleri | GET | `/api/DocumentSerialType/avaible/customer/{customerTypeId}/salesrep/{salesRepId}/rule/2` | `customerTypeId`, `salesRepId` belli; Quotation = 2 | `ApiResponse<DocumentSerialTypeGetDto[]>` |
| 9 | Fiyat kuralları | GET | `/api/quotation/price-rule-of-quotation` | `customerCode`, `salesmenId`, `quotationDate` | `ApiResponse<PricingRuleLineGetDto[]>` |
| 10 | Temsilci indirim limitleri | GET | `/api/UserDiscountLimit/salesperson/{salespersonId}` | Temsilci seçili | `ApiResponse<UserDiscountLimitDto[]>` |

**customerCode:** CRM’de `CustomerDto.customerCode`, ERP’de `erpCustomerCode` (cari kodu). **salesmenId:** `representativeId`. **quotationDate:** `offerDate` (teklif tarihi; YYYY-MM-DD).

### 3.4. Ürün / Satır

| # | Amaç | HTTP | Endpoint | Ne Zaman | Dönen |
|---|------|------|----------|----------|--------|
| 11 | Ürün fiyatı | GET | `/api/quotation/price-of-product` | Ürün seçilince / satır açılınca | `ApiResponse<PriceOfProductDto[]>` |
| 12 | Stok detay | GET | `/api/Stock/{id}` | İlişkili stok / ürün bilgisi | `ApiResponse<StockGetDto>` |

**price-of-product query:** `request[0].productCode=...&request[0].groupCode=...`; birden fazla ürün için `request[1]...` eklenir.

### 3.5. Ürün Listesi (Dropdown)

| # | Amaç | HTTP | Endpoint | Dönen |
|---|------|------|----------|--------|
| 13 | Stok listesi (ürün seçici) | GET | `/api/Stock` | `page`, `pageSize` (örn. `page=1`, `pageSize=100`); `pageNumber`/`pageSize` kullanan backend’lerde buna göre uyarlanır. `ApiResponse<PagedResponse<StockGetDto>>` (sayfalı). **UI:** Scroll tabanlı pagination (**§2.5**); dropdown/modal içinde FlatList + `onEndReached`. |

### 3.6. Teklif Oluşturma

| # | Amaç | HTTP | Endpoint | Body | Dönen |
|---|------|------|----------|------|--------|
| 14 | Teklif oluştur | POST | `/api/quotation/bulk-quotation` | `QuotationBulkCreateDto` | `ApiResponse<QuotationGetDto>` |

### 3.6.1. Kayıtlı Teklif Verileri (Detay / Düzenleme)

Kayıtlı bir teklifin **satır** ve **döviz kurları** verileri aşağıdaki isteklerle oluşturulur:

| # | Amaç | HTTP | Endpoint | Dönen |
|---|------|------|----------|--------|
| 15 | Kayıtlı teklif satırları | GET | `/api/QuotationLine/by-quotation/{quotationId}` | `ApiResponse<QuotationLineGetDto[]>` veya eşdeğeri |
| 16 | Kayıtlı teklif döviz kurları | GET | `/api/QuotationExchangeRate/quotation/{quotationId}` | `ApiResponse<QuotationExchangeRateGetDto[]>` veya eşdeğeri |

Detay/düzenleme ekranı açılırken satır listesi **#15**, kurlar **#16** ile doldurulur.

### 3.6.2. Kayıtlı Teklifte Satır Ekleme (create-multiple)

**Kayıtlı** bir teklif içindeyken (detay/düzenleme ekranı) **satır ekle** kullanıldığında:

- **API:** `POST /api/QuotationLine/create-multiple`
- **Body:** `CreateQuotationLineDto[]` (eklenen satırlar). Her satırda `quotationId` = **mevcut teklif id**.
- **Ön koşullar:** §8.7 kuralları geçerli (müşteri, temsilci, para birimi seçili). Bağlı stokla çoklu satır ekleniyorsa tümü aynı istekte gönderilir.

Başarılı yanıt sonrası liste yenilenir (örn. `GET /api/QuotationLine/by-quotation/{quotationId}` ile tekrar çekilir veya yanıt ile güncellenir).

**Kurlar:** Kayıtlı teklifte kurlar dialogunda değer değiştirilip **Kaydet** denirse `PUT /api/QuotationExchangeRate/update-exchange-rate-in-quotation` kullanılır (**§8.6**).

### 3.7. POST Body Oluşturma (bulk-quotation)

- **quotation:** Form değerlerinden `CreateQuotationDto`. `potentialCustomerId` / `erpCustomerCode` / `shippingAddressId` / `representativeId` / `paymentTypeId` / `documentSerialTypeId` / `revisionId` 0 veya boşsa **null** gönder.
- **lines:** Her satır için `id`, `isEditing`, `relatedLines` **çıkarılır**. `quotationId = 0`, `productId = 0` (veya null, backend’e göre). `description` null ise null gönder. `pricingRuleHeaderId` ve `relatedStockId` 0 veya geçersizse **null** gönder.
- **exchangeRates:** Varsa `id`, `dovizTipi` gönderilmez; `currency` (string), `exchangeRate`, `exchangeRateDate`, `isOfficial`, `quotationId = 0`. Boşsa `exchangeRates: []` veya alan atlanır.

### 3.8. Kaydet Sonrası – Sonraki Adım

**Önce:** Kaydet (submit) sırasında buton disabled, metin “Kaydediliyor...” olur. `POST /api/quotation/bulk-quotation` atılır.

**Başarılı yanıt** (`result.success === true` ve `result.data` mevcut):

1. **Toast:** Başlık *“Teklif Başarıyla Oluşturuldu”*, açıklama *“Teklif onay sürecine gönderildi.”*
2. **Yönlendirme:** **Teklif detay** ekranına gidilir; route `/quotations/{id}`, `id = result.data.id`. Örn. `navigate('/quotations/' + result.data.id)`. Kullanıcı Create ekranından çıkar, oluşturulan teklifin detay sayfasında kalır.
3. **Sonraki adım:** Kullanıcı artık **teklif detay** ekranındadır. Oradan teklifi görüntüleyebilir, revizyon açabilir, onay akışına göre ilerleyebilir; Create akışı tamamlanmıştır. Detay ekranında **satırlar** `GET /api/QuotationLine/by-quotation/{quotationId}`, **döviz kurları** `GET /api/QuotationExchangeRate/quotation/{quotationId}` ile oluşturulur (**§3.6.1**).

**Başarısız yanıt** veya **hata** (network / 4xx / 5xx):

1. **Toast:** Başlık *“Teklif Oluşturulamadı”*, açıklama `result.message` veya *“Teklif oluşturulurken bir hata oluştu.”* (uzun süre gösterilebilir, örn. 10 sn).
2. **Konum:** Kullanıcı **Create ekranında kalır**. Form ve satırlar **korunur**; tekrar “Teklifi Kaydet” ile deneyebilir.

**Özet:** Kaydet sonrası **sonraki adım** = başarıda **teklif detay sayfası** (`/quotations/{id}`), hata durumunda **create sayfasında kalma** ve formu koruyup tekrar deneme.

**Stok işlemlerinde oluşturmadaki kurallar geçerli:**  
Kaydet **başarılı** olduktan sonra açılan ekranda (teklif detay / düzenleme) gösterilen **stok satırlarındaki miktar ve iskonto kontrolleri**, oluşturma ekranındaki **koşullarla aynıdır**. Miktar değişince (§8.8) ve iskonto değişince (§8.9) uygulanan kurallar, validasyonlar ve UI davranışı değişmez.

Buna ek olarak tüm **stok / satır işlemleri** (satır ekleme, ürün seçimi, bağlı stok, kurlar, para birimi değişimi vb.) **oluşturma ekranındaki kurallara** tabidir:

- **Dropdown, arama, sesli komut** (§2), **scroll tabanlı pagination** (§2.5) aynen uygulanır.
- **Satır ekle ön kontrolleri** (§8.7): müşteri, temsilci, para birimi seçili olmadan satır eklenmez. **Kayıtlı teklifte** satır ekleme → `POST /api/QuotationLine/create-multiple` (**§3.6.2**).
- **Miktar kontrolü** (§8.8): fiyat kuralı, ilişkili satır güncellemesi, indirim senkronizasyonu **oluşturmadaki koşullarla aynı**.
- **İskonto kontrolü** (§8.9): indirim limiti, “Onay Gerekli” gösterimi, 0–100 aralığı **oluşturmadaki koşullarla aynı**.
- **Bağlı stok** (§8.10), **döviz değişimi** (§8.5), **kurlar dialogu** (§8.6) aynı kalır. Kayıtlı teklifte kurlar dialogunda **Kaydet** → `PUT .../update-exchange-rate-in-quotation`, **İptal/Kapat** → çekilen veriye revert (§8.6).
- **Validasyonlar** ve **hesaplamalar** aynı kalır.
- **Kayıtlı satır silme** (§8.11): Onay metni bağlı stok / tek stok için farklı; onayda `DELETE /api/QuotationLine/{id}`, başarıda o satır ve aynı `relatedProductKey`’e sahip kalemler listeden kaldırılır.
- **Onaya gönder** (§8.12): Tutar **daima TL**, birim **1**. `totalAmount` = `grandTotal` (TL ise) veya `grandTotal × kur` (döviz ise); **döviz ile çarpmayı unutma**.

Özetle: Kaydet sonrası ekrandaki **stoklardaki miktar ve iskonto kontrolü** dahil tüm stok işlemleri **oluşturmadaki koşullarla aynıdır**; kayıtlı satır silme **§8.11**, onaya gönder **§8.12**.

---

## 4. Ortak Tipler: ApiResponse, PagedResponse, PagedParams, PagedFilter

Tüm GET liste istekleri `ApiResponse<PagedResponse<T>>` veya `ApiResponse<T[]>`; tekil istekler `ApiResponse<T>` döner. `data` kullanılır.

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  exceptionMessage: string;
  data: T;
  errors: string[];
  timestamp: string;
  statusCode: number;
  className: string;
}

interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface PagedParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  filters?: PagedFilter[];
}

interface PagedFilter {
  column: string;
  operator: string;
  value: string;
}
```

Backend bazen `items` döner; `data` yoksa `items`’ı `data` gibi kullanarak normalize et.

---

## 5. DTO’lar – Tam Tanımlar (İçerik Eksiksiz)

Aşağıdaki DTO’lar **tam ve eksiksiz**dir. Sadece burada yazan alanlar kullanılacakmış gibi düşünülebilir; eksik bırakılan alan yoktur.

### 5.1. ApprovalScopeUserDto (Satış temsilcisi dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| flowId | number | Akış id |
| userId | number | Kullanıcı id; **select value ve key** olarak kullan. Formda `representativeId` = `userId`. |
| firstName | string | Ad |
| lastName | string | Soyad |
| roleGroupName | string | Rol grubu adı |
| stepOrder | number | Adım sırası |

**Dropdown:** Label = `firstName + ' ' + lastName`. Search / sesli komut bu tam ad veya parçasına göre filtreler.

---

### 5.2. PaymentTypeDto (Ödeme planı dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | **Value/key.** |
| name | string | **Label, search.** |
| description | string | Opsiyonel |
| createdDate | string | |
| updatedDate | string | Opsiyonel |
| deletedDate | string | Opsiyonel |
| isDeleted | boolean | |
| createdByFullUser | string | Opsiyonel |
| updatedByFullUser | string | Opsiyonel |
| deletedByFullUser | string | Opsiyonel |

Dropdown’da `id` / `name` kullan. Listeden `PaymentType[]` için `{ id, name }` yeterli.

---

### 5.3. KurDto (Para birimi dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| dovizTipi | number | **Value.** `currency` alanında string olarak saklanabilir. |
| dovizIsmi | string \| null | **Label, search.** |
| kurDegeri | number \| null | Kur değeri |

Dropdown value = `dovizTipi`, label = `dovizIsmi`.

---

### 5.4. CustomerDto (CRM müşteri dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | **Value/key.** `potentialCustomerId` = `id`. |
| name | string | **Label, search.** |
| customerCode | string | Opsiyonel; **search.** `customerCode` → müşteri kodu. |
| customerTypeId | number | Opsiyonel; seri tip endpoint’i için. |
| customerTypeName | string | Opsiyonel |
| taxNumber | string | Opsiyonel |
| taxOffice | string | Opsiyonel |
| tcknNumber | string | Opsiyonel |
| address | string | Opsiyonel |
| phone | string | Opsiyonel |
| phone2 | string | Opsiyonel |
| email | string | Opsiyonel |
| website | string | Opsiyonel |
| notes | string | Opsiyonel |
| countryId | number | Opsiyonel |
| countryName | string | Opsiyonel |
| cityId | number | Opsiyonel |
| cityName | string | Opsiyonel |
| districtId | number | Opsiyonel |
| districtName | string | Opsiyonel |
| salesRepCode | string | Opsiyonel |
| groupCode | string | Opsiyonel |
| creditLimit | number | Opsiyonel |
| branchCode | number | |
| businessUnitCode | number | |
| createdDate | string | |
| updatedDate | string | Opsiyonel |
| isDeleted | boolean | |
| createdByFullUser | string | Opsiyonel |
| updatedByFullUser | string | Opsiyonel |
| deletedByFullUser | string | Opsiyonel |

Search / sesli komut: `name`, `customerCode` vb. üzerinden.

---

### 5.5. CariDto (ERP müşteri dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| subeKodu | number | |
| isletmeKodu | number | |
| cariKod | string | **Value.** `erpCustomerCode` = `cariKod`. |
| cariIsim | string | Opsiyonel; **label, search.** |
| cariTel | string | Opsiyonel |
| cariIl | string | Opsiyonel |
| cariAdres | string | Opsiyonel |
| cariIlce | string | Opsiyonel |
| ulkeKodu | string | Opsiyonel |
| email | string | Opsiyonel |
| web | string | Opsiyonel |
| vergiNumarasi | string | Opsiyonel |
| vergiDairesi | string | Opsiyonel |
| tcknNumber | string | Opsiyonel |

Search / sesli komut: `cariKod`, `cariIsim` üzerinden.

---

### 5.6. ShippingAddressDto (Sevk adresi dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | **Value/key.** `shippingAddressId` = `id`. |
| address | string | **Label, search.** UI’da `addressText` = `address` kullanılabilir. |
| customerId | number | |
| postalCode | string | Opsiyonel |
| contactPerson | string | Opsiyonel |
| phone | string | Opsiyonel |
| notes | string | Opsiyonel |
| customerName | string | Opsiyonel |
| countryId | number | Opsiyonel |
| countryName | string | Opsiyonel |
| cityId | number | Opsiyonel |
| cityName | string | Opsiyonel |
| districtId | number | Opsiyonel |
| districtName | string | Opsiyonel |
| isActive | boolean | |
| createdDate | string | |
| updatedDate | string | Opsiyonel |
| deletedDate | string | Opsiyonel |
| isDeleted | boolean | |
| createdBy | number | Opsiyonel |
| updatedBy | number | Opsiyonel |
| deletedBy | number | Opsiyonel |
| createdByFullUser | string | Opsiyonel |
| updatedByFullUser | string | Opsiyonel |
| deletedByFullUser | string | Opsiyonel |

---

### 5.7. DocumentSerialTypeGetDto (Seri no dropdown)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | **Value/key.** `documentSerialTypeId` = `id`. |
| serialPrefix | string \| null | **Label, search.** Boş olanlar filtrelenebilir. |
| ruleType | number | PricingRuleType; Quotation = 2. |
| customerTypeId | number \| null | Opsiyonel |
| customerTypeName | string \| null | Opsiyonel |
| salesRepId | number \| null | Opsiyonel |
| salesRepFullName | string \| null | Opsiyonel |
| serialLength | number \| null | Opsiyonel |
| serialStart | number \| null | Opsiyonel |
| serialCurrent | number \| null | Opsiyonel |
| serialIncrement | number \| null | Opsiyonel |
| createdDate | string | |
| updatedDate | string \| null | Opsiyonel |
| createdBy | string | Opsiyonel |
| createdByFullName | string | Opsiyonel |
| createdByFullUser | string | Opsiyonel |

---

### 5.8. PricingRuleLineGetDto (Fiyat kuralları; satır indirimleri)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | |
| pricingRuleHeaderId | number | |
| stokCode | string | Ürün kodu; eşleşme için. |
| minQuantity | number | |
| maxQuantity | number \| null | Opsiyonel |
| fixedUnitPrice | number \| null | Opsiyonel |
| currencyCode | string | |
| discountRate1 | number | |
| discountAmount1 | number | |
| discountRate2 | number | |
| discountAmount2 | number | |
| discountRate3 | number | |
| discountAmount3 | number | |
| createdAt | string \| null | Opsiyonel |
| updatedAt | string \| null | Opsiyonel |

Satır eklerken / fiyat doldururken `stokCode` / grup eşleşmesine göre indirimler uygulanır.

---

### 5.9. UserDiscountLimitDto (Temsilci indirim limitleri)

| Alan | Tip | Açıklama |
|------|-----|----------|
| erpProductGroupCode | string | Satır `groupCode` ile eşleşir. |
| salespersonId | number | |
| salespersonName | string | |
| maxDiscount1 | number | `discountRate1` ≤ bu değer. |
| maxDiscount2 | number \| null | Opsiyonel; `discountRate2` limiti. |
| maxDiscount3 | number \| null | Opsiyonel; `discountRate3` limiti. |
| id | number | Opsiyonel |
| createdAt | string \| null | Opsiyonel |
| updatedAt | string \| null | Opsiyonel |
| createdBy | number \| null | Opsiyonel |
| updatedBy | number \| null | Opsiyonel |
| deletedBy | number \| null | Opsiyonel |

---

### 5.10. PriceOfProductDto (Ürün fiyatı)

| Alan | Tip | Açıklama |
|------|-----|----------|
| productCode | string | |
| groupCode | string | |
| currency | string | Para birimi; dönüşüm için. |
| listPrice | number | Birim fiyat kaynağı. |
| costPrice | number | |
| discount1 | number \| null | Opsiyonel; indirim 1 (%) |
| discount2 | number \| null | Opsiyonel; indirim 2 (%) |
| discount3 | number \| null | Opsiyonel; indirim 3 (%) |

Ürün seçilince birim fiyat ve indirimler buradan alınır; kur dönüşümü uygulanabilir. **Satıra uygulama:** `listPrice` → `unitPrice` (hedef para birimine kur dönüşümü ile); `discount1` / `discount2` / `discount3` → satır `discountRate1` / `discountRate2` / `discountRate3`.

---

### 5.11. StockGetDto (Ürün dropdown + ilişkili)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | **Stok id;** ilişkili için `relatedStockId` vb. |
| erpStockCode | string | **productCode** olarak kullan. **Search.** |
| stockName | string | **productName**, **label, search.** |
| grupKodu | string | Opsiyonel; **groupCode**. |
| grupAdi | string | Opsiyonel |
| unit | string | Opsiyonel |
| ureticiKodu | string | Opsiyonel |
| kod1–kod5 | string | Opsiyonel |
| kod1Adi–kod5Adi | string | Opsiyonel |
| branchCode | number | |
| stockDetail | StockDetailGetDto | Opsiyonel |
| stockImages | StockImageDto[] | Opsiyonel |
| parentRelations | StockRelationDto[] | Opsiyonel; ilişkili stoklar. |
| createdAt | string | Opsiyonel |
| updatedAt | string | Opsiyonel |
| createdBy | number | Opsiyonel |
| updatedBy | number | Opsiyonel |

**StockRelationDto:**

| Alan | Tip |
|------|-----|
| id | number |
| stockId | number |
| stockName | string |
| relatedStockId | number |
| relatedStockCode | string |
| relatedStockName | string |
| quantity | number |
| description | string |
| isMandatory | boolean |
| createdAt | string |
| updatedAt | string |

Ürün dropdown’da `id`, `erpStockCode`, `stockName`, `grupKodu` kullanılır. Search / sesli komut `stockName`, `erpStockCode` üzerinden.

---

### 5.12. Create / Bulk DTO’lar (Request)

**CreateQuotationDto (header):**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|--------|----------|
| offerType | string | Evet | `'Domestic'` \| `'Export'` |
| currency | string | Evet | Para birimi; `dovizTipi` string. |
| potentialCustomerId | number \| null | Hayır | CRM müşteri id. |
| erpCustomerCode | string \| null | Hayır | ERP cari kodu. |
| deliveryDate | string \| null | Hayır | YYYY-MM-DD; submit’te zorunlu. |
| shippingAddressId | number \| null | Hayır | |
| representativeId | number \| null | Hayır | `userId`. |
| status | number \| null | Hayır | |
| description | string \| null | Hayır | Max 500 karakter. |
| paymentTypeId | number \| null | Hayır | Submit’te zorunlu. |
| documentSerialTypeId | number \| null | Hayır | |
| offerDate | string \| null | Hayır | YYYY-MM-DD; default bugün. |
| offerNo | string \| null | Hayır | Max 50. |
| revisionNo | string \| null | Hayır | Max 50. |
| revisionId | number \| null | Hayır | |

**CreateQuotationLineDto (satır):**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|--------|----------|
| quotationId | number | Evet | Create’te 0; kayıtlı teklifte mevcut teklif id. |
| productId | number \| null | Hayır | |
| productCode | string | Evet | Max 100. |
| productName | string | Evet | Max 250. |
| groupCode | string \| null | Hayır | |
| quantity | number | Evet | |
| unitPrice | number | Evet | |
| discountRate1 | number | Evet | |
| discountAmount1 | number | Evet | Hesaplanan. |
| discountRate2 | number | Evet | |
| discountAmount2 | number | Evet | Hesaplanan. |
| discountRate3 | number | Evet | |
| discountAmount3 | number | Evet | Hesaplanan. |
| vatRate | number | Evet | |
| vatAmount | number | Evet | Hesaplanan. |
| lineTotal | number | Evet | Hesaplanan. |
| lineGrandTotal | number | Evet | Hesaplanan. |
| description | string \| null | Hayır | Max 250. |
| pricingRuleHeaderId | number \| null | Hayır | |
| relatedStockId | number \| null | Hayır | |
| relatedProductKey | string \| null | Hayır | |
| isMainRelatedProduct | boolean | Hayır | |
| approvalStatus | number | Hayır | ApprovalStatus; default 0 (HavenotStarted). |

**create-multiple** body: `CreateQuotationLineDto[]`. Kayıtlı teklifte satır eklerken kullanılır (**§3.6.2**).

**QuotationExchangeRateCreateDto (opsiyonel kurlar):**

| Alan | Tip | Açıklama |
|------|-----|----------|
| quotationId | number | 0. |
| currency | string | |
| exchangeRate | number | |
| exchangeRateDate | string | YYYY-MM-DD. |
| isOfficial | boolean | Opsiyonel |

**QuotationExchangeRateGetDto (kurlar GET yanıtı / PUT body):**

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | Kayıtlı kur satırı id; PUT’ta gönderilir. |
| quotationId | number | |
| currency | string | |
| exchangeRate | number | |
| exchangeRateDate | string | YYYY-MM-DD. |
| isOfficial | boolean | Resmi / özel ayrımı. |
| createdAt | string | Opsiyonel |
| updatedAt | string \| null | Opsiyonel |

**QuotationLineFormState (form satır state’i; POST’ta çıkarılır):**

Create/düzenleme ekranında satır listesi bu tip ile tutulur. **Alanlar:** `CreateQuotationLineDto` alanları (örn. `productCode`, `productName`, `quantity`, `unitPrice`, `discountRate1`–`3`, `vatRate`, vb.) + **ek alanlar:** `id: string` (geçici unique key), `isEditing: boolean`, `relatedLines?: QuotationLineFormState[]`. POST body oluşturulurken `id`, `isEditing`, `relatedLines` **gönderilmez**; `quotationId` eklenir (create’te 0, kayıtlı teklifte teklif id).

**QuotationBulkCreateDto (POST body):**

| Alan | Tip |
|------|-----|
| quotation | CreateQuotationDto |
| lines | CreateQuotationLineDto[] |
| exchangeRates | QuotationExchangeRateCreateDto[] (opsiyonel) |

---

### 5.13. QuotationGetDto (POST yanıtı `data`)

| Alan | Tip |
|------|-----|
| id | number |
| potentialCustomerId | number \| null |
| potentialCustomerName | string \| null |
| erpCustomerCode | string \| null |
| deliveryDate | string \| null |
| shippingAddressId | number \| null |
| shippingAddressText | string \| null |
| representativeId | number \| null |
| representativeName | string \| null |
| status | number \| null |
| description | string \| null |
| paymentTypeId | number \| null |
| paymentTypeName | string \| null |
| documentSerialTypeId | number \| null |
| offerType | string |
| offerDate | string \| null |
| offerNo | string \| null |
| revisionNo | string \| null |
| revisionId | number \| null |
| currency | string |
| total | number |
| grandTotal | number |
| hasCustomerSpecificDiscount | boolean |
| validUntil | string \| null |
| contactId | number \| null |
| activityId | number \| null |
| createdAt | string |
| updatedAt | string \| null |
| createdBy | string \| null |
| updatedBy | string \| null |
| lines | QuotationLineGetDto[] (opsiyonel) |
| exchangeRates | QuotationExchangeRateGetDto[] (opsiyonel) |

Yönlendirme için `id` yeterli.

### 5.14. QuotationLineGetDto (by-quotation yanıtı, satır detay)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | number | BaseEntityDto; satır id. |
| quotationId | number | |
| productId | number \| null | |
| productCode | string \| null | |
| productName | string | |
| groupCode | string \| null | |
| quantity | number | |
| unitPrice | number | |
| discountRate1 | number | |
| discountAmount1 | number | |
| discountRate2 | number | |
| discountAmount2 | number | |
| discountRate3 | number | |
| discountAmount3 | number | |
| vatRate | number | |
| vatAmount | number | |
| lineTotal | number | |
| lineGrandTotal | number | |
| description | string \| null | |
| pricingRuleHeaderId | number \| null | |
| relatedStockId | number \| null | |
| relatedProductKey | string \| null | |
| isMainRelatedProduct | boolean | |
| approvalStatus | number | ApprovalStatus; 0 = HavenotStarted vb. |
| createdAt | string | Opsiyonel |
| updatedAt | string \| null | Opsiyonel |

`GET /api/QuotationLine/by-quotation/{quotationId}` yanıtında kullanılır.

### 5.15. UpdateQuotationLineDto (satır güncelleme)

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|--------|----------|
| productId | number | Evet | |
| productCode | string \| null | Max 100. |
| productName | string | Evet | Max 250. |
| groupCode | string \| null | Max 50. |
| quantity | number | Evet | |
| unitPrice | number | Evet | |
| discountRate1 | number | Evet | |
| discountAmount1 | number | Evet | |
| discountRate2 | number | Evet | |
| discountAmount2 | number | Evet | |
| discountRate3 | number | Evet | |
| discountAmount3 | number | Evet | |
| vatRate | number | Evet | |
| vatAmount | number | Evet | |
| lineTotal | number | Evet | |
| lineGrandTotal | number | Evet | |
| description | string \| null | Max 250. |
| pricingRuleHeaderId | number \| null | Hayır | |
| relatedStockId | number \| null | Hayır | |
| relatedProductKey | string \| null | Hayır | |
| isMainRelatedProduct | boolean | Hayır | |
| approvalStatus | number | Hayır | |

Satır güncelleme isteklerinde kullanılır (ilgili endpoint varsa).

---

## 6. Form Alanları (Header)

| Alan | UI | Zorunlu | Kaynak | Value / Not |
|------|-----|--------|--------|-------------|
| Müşteri | **Dropdown + search + sesli** | Evet | CRM + ERP | CRM → `potentialCustomerId`; ERP → `erpCustomerCode`. **Karşılıklı dışlama:** CRM seçilince `erpCustomerCode` temizlenir, ERP seçilince `potentialCustomerId` temizlenir. |
| Satış temsilcisi | **Dropdown + search + sesli** | Hayır | related-users | `userId`; default `user?.id` |
| Sevk adresi | **Dropdown + search + sesli** | Hayır | ShippingAddress | `shippingAddressId`. **Sadece CRM müşteri** seçiliyken liste doldurulur (`/api/ShippingAddress/customer/{customerId}`); ERP müşteride liste boş / alan devre dışı. |
| Para birimi | **Dropdown + search + sesli** | Evet | KurDto | `currency` = `dovizTipi` (string) |
| Ödeme planı | **Dropdown + search + sesli** | Evet (submit) | PaymentType | `paymentTypeId` |
| Teklif tipi | **Dropdown** | Evet | Sabit | `Domestic` \| `Export` |
| Teklif tarihi | Date picker | Hayır | - | `offerDate`; default bugün |
| Teslim tarihi | Date picker | Evet (submit) | - | `deliveryDate` |
| Seri no | **Dropdown + search + sesli** | Hayır | DocumentSerialType | `documentSerialTypeId`. **Disabled** koşulu: `customerTypeId === undefined` veya `!representativeId` (müşteri tipi veya temsilci yoksa seçim yapılamaz). |
| Notlar | Textarea | Hayır | - | `description`; max 500 |
| Kurlar | Opsiyonel form | Hayır | - | `exchangeRates`; dönüşüm + POST |

**Varsayılan değerler:** `offerType` = `'Domestic'`, `offerDate` = bugün (YYYY-MM-DD), `representativeId` = giriş yapan `user.id` (varsa). Yeni satırda `quantity` = 1, `vatRate` = 18.

---

## 7. Satır (Line) Alanları

| Alan | UI | Zorunlu | Not |
|------|-----|--------|-----|
| Ürün | **Dropdown + search + sesli** | Evet | Stock listesi; `productCode`, `productName`, `groupCode`, `relatedStockId`. İlişkili stoklar (`parentRelations`) varsa ana seçilince **bağlı stoklarla birlikte** çoklu satır eklenir (**§8.10**). |
| Miktar | Sayı input | Evet | `quantity` |
| Birim fiyat | Sayı input (read-only) | Evet | `unitPrice`; price-of-product + kur dönüşümü ile doldurulur, kullanıcı manuel değiştirmez. Miktar değişince fiyat kuralı (**§8.8**) ile güncellenebilir. |
| İndirim 1–3 (%) | Sayı input | Evet | `discountRate1`–`3`; amount’lar hesaplanan |
| KDV oranı | Sayı input | Evet | `vatRate`; default 18 |
| Açıklama | Metin | Hayır | `description` |

`lineTotal`, `vatAmount`, `lineGrandTotal` hesaplanır. **Satır kaydet** butonu, `productCode` / `productName` seçili değilse **disabled** olur.

---

## 8. Validasyonlar ve Kontroller

### 8.1. Schema (Zod)

- `offerType`: required string.
- `currency`: required, min 1 karakter.
- `potentialCustomerId` / `erpCustomerCode`: optional; müşteri olarak biri dolu olmalı.
- `description`: max 500; `offerNo`, `revisionNo`: max 50; `erpCustomerCode`: max 50.

### 8.2. Submit Öncesi

1. **Müşteri:** `potentialCustomerId` veya `erpCustomerCode` **en az biri** dolu olmalı (CRM veya ERP). Eksikse toast: *“Lütfen müşteri seçiniz.”* → submit yapılmaz.
2. En az **1 satır**. Yoksa toast: *“En az 1 satır eklenmelidir.”*
3. `paymentTypeId` dolu. Eksikse toast: *“Ödeme tipi seçilmelidir.”*
4. `deliveryDate` dolu. Eksikse toast: *“Teslimat tarihi girilmelidir.”*
5. `currency` geçerli (boş / `'0'` değil). Eksikse toast: *“Geçerli bir para birimi seçilmelidir.”*
6. Form schema validasyonları geçmeli. Hata varsa toast: *“Lütfen form alanlarını kontrol ediniz.”*

Kontrol sırası: önce 1–5, ardından schema. İlk ihlalde ilgili toast gösterilir ve submit durdurulur. **Submit butonu** (“Teklifi Kaydet”): istek süresince **disabled**, metin “Kaydediliyor...” olur.

### 8.3. Satır Eklerken

Müşteri (CRM veya ERP), temsilci ve para birimi seçili olmalı; değilse uyarı. **“Satır ekle” tıklanınca** ve **ürün seçilip satıra geçilirken** yapılan kontrollerin detayı **§8.7**’de verilir.

### 8.4. İndirim Limitleri

`groupCode` ↔ `erpProductGroupCode`; `discountRate1` ≤ `maxDiscount1` vb. Aşımda **“Onay Gerekli”** gösterimi. Detaylı kontrol ve UI (**§8.9**).

### 8.5. Döviz (Para Birimi) Değiştiğinde Yapılacaklar

Header’da **para birimi** dropdown’undan farklı bir kur seçildiğinde aşağıdaki akış uygulanır.

#### Koşullar

- **Satır yoksa** (`lines.length === 0`): Para birimi **doğrudan** güncellenir; dialog açılmaz.
- **Satır varsa**: **Kur değişikliği** dialogu açılır; kullanıcı onaylayana kadar para birimi değişmez.

#### Kur değişikliği dialogu

- **Başlık:** “Kur Değişikliği”
- **Açıklama:** “Para birimi değişikliği tüm satırları etkileyecektir. Devam etmek istiyor musunuz?”
- **Vazgeç:** Dialog kapanır; para birimi **değişmez**, bekleyen yeni kur iptal edilir.
- **Onayla:** Para birimi yeni değere güncellenir; **tüm satırların** birim fiyatları yeni paraya çevrilir; dialog kapanır.

#### Dönüşüm formülü (onay sonrası)

- **Eski para birimi** `oldCurrency` (dovizTipi), **yeni** `newCurrency` (dovizTipi).
- **Kur kaynağı:** Önce teklif **exchangeRates** (kurlar dialogundan kaydedilen), yoksa **ERP kurları** (`getExchangeRate`). `findExchangeRateByDovizTipi(dovizTipi, exchangeRates, erpRates)` ile her para birimi için kur alınır.
- `oldRate` = eski para birimi kuru, `newRate` = yeni para birimi kuru. İkisi de tanımlı ve > 0 olmalı.
- **Oran:** `conversionRatio = oldRate / newRate`
- **Her satır için:** `newUnitPrice = line.unitPrice * conversionRatio`; satır `calculateLineTotals` ile yeniden hesaplanır.
- **İlişkili satırlar** da aynı şekilde kendi `unitPrice` üzerinden çevrilir.

#### İlk yükleme

- Sayfa ilk açıldığında veya `initialCurrency` set edilirken para birimi değişiminde dialog **açılmaz**; sadece currency güncellenir (ilk yükleme / revizyon senaryosu).

---

### 8.6. Kurlar Penceresi (Exchange Rate Dialog)

Header’da “Kurlar” butonuna tıklanınca bir **modal / dialog** açılır. Aşağıdaki açıklamalar, alanlar ve olaylar uygulanmalıdır.

### Açıklamalar ve metinler

- **Başlık:** “Döviz Kurları”
- **Alt başlık:** “Güncel kur değerlerini yönetin”
- **Bilgi kutusu (mutlaka gösterilir):**  
  *“Burada yapılan değişiklikler sadece bu teklif için geçerlidir ve genel sistem kurlarını etkilemez. Değiştirilen kurlar ‘Özel’ olarak işaretlenir.”*

### Veri kaynağı ve açılış

- Dialog açıldığında `GET /api/Erp/getExchangeRate?tarih=YYYY-MM-DD&fiyatTipi=1` ile kurlar çekilir. **tarih** genelde **bugün** (YYYY-MM-DD); isteğe bağlı teklif tarihi kullanılabilir.
- Gelen `KurDto[]` (ERP kurları), formda tutulan `exchangeRates` ile birleştirilir:
  - Aynı `dovizTipi` için `exchangeRates`’te kayıt varsa: `exchangeRate`, `exchangeRateDate`, `isOfficial` mevcut değerlerden alınır.
  - Yoksa: `exchangeRate` = `rate.kurDegeri`, `exchangeRateDate` = bugün (YYYY-MM-DD), `isOfficial` = ERP’den gelen kur varsa `true`.
- Sonuç tabloda **Para birimi**, **Kur değeri**, **Durum**, **İşlemler** sütunlarıyla gösterilir.

### Mobile için – Kurlar dialogu veri akışı (basit özet)

Dialog **nasıl dolar**, **veri nereden gelir** kısaca:

1. **Tablo satırları nereden gelir?**  
   `GET /api/Erp/getExchangeRate?tarih=YYYY-MM-DD&fiyatTipi=1` atılır. Dönen `KurDto[]` = ERP’deki **tüm** para birimleri (TRY, USD, EUR, vb.). Tablo **bu listenin her elemanı için bir satır** gösterir. Satır sayısı = ERP’deki para birimi sayısı. Yani **liste ERP’den**, teklif kurları sadece **değerleri override** eder.

2. **Her satırdaki kur değeri nereden gelir?**  
   Teklif tarafında `exchangeRates` var (create’te form state; detay’da önce `GET /api/QuotationExchangeRate/quotation/{id}` ile doldurulmuş state). Her tablo satırı için `dovizTipi` ile eşleşen kayıt aranır:
   - **Varsa:** `exchangeRate`, `exchangeRateDate`, `isOfficial` bu kayıttan alınır.
   - **Yoksa:** `exchangeRate` = ERP’deki `kurDegeri`, `exchangeRateDate` = bugün, `isOfficial` = true.

3. **Kaydet ve Uygula ne yapar?**  
   Dialog içinde kullanıcının gördüğü/güncellediği liste `localRates` olarak tutulur. **Kaydet ve Uygula** → `onSave(localRates)`; üst bileşen `exchangeRates` state’ini bu liste ile günceller, dialog kapanır. Create’te bu liste POST body’deki `exchangeRates` olarak kullanılır; detay’da **Kaydet** ile `PUT .../update-exchange-rate-in-quotation` atılır.

4. **Kullanımda olan kur:**  
   Formda seçili para birimi (`quotation.currency` = `currentCurrency`) hangi `dovizTipi` ise, o satırda kur **düzenlenemez**. Düzenle butonu disabled; tıklanırsa toast: *"Kullanımda olan kur değiştirilemez."*

5. **Create vs Detay:**  
   - **Create:** `exchangeRates` sadece form state. Kurlar API’si yalnızca ERP `getExchangeRate`. Dialog açılınca ERP + formdaki `exchangeRates` birleştirilir (yukarıdaki kurallarla). Kaydet → `exchangeRates` güncellenir, POST’ta gönderilir.
   - **Detay:** `exchangeRates` önce `GET /api/QuotationExchangeRate/quotation/{id}` ile doldurulur. Dialog açılınca yine ERP + bu `exchangeRates` birleştirilir. Kaydet → `PUT .../update-exchange-rate-in-quotation`; İptal/Kapat → çekilen veriye revert.

**Özet:** Tablo = ERP’deki tüm para birimleri. Değerler = teklif `exchangeRates` (varsa) yoksa ERP. Kaydet = `localRates` → `exchangeRates` güncelle (create’te POST’a, detay’da PUT’a gider).

### Tablo ve alanlar

| Sütun | İçerik |
|-------|--------|
| Para birimi | `dovizIsmi` veya `DOVIZ_{dovizTipi}` |
| Kur değeri | Sayı input (step 0.0001, min 0); düzenleme modunda değiştirilebilir |
| Durum | **Resmi:** ERP ile aynı, değiştirilmedi. **Özel:** Kullanıcı değeri değiştirdi. |
| İşlemler | Düzenle (kalem) / Onay (✓) / Vazgeç (✗) |

### Kur değiştirme kuralları

- **Kullanımda olan para birimi:** Formda seçili `currency` (= `currentCurrency`) hangi `dovizTipi` ise, o satırdaki kur **değiştirilemez**.
  - Düzenle butonu **disabled**.
  - Tıklanırsa toast: *“Kullanımda olan kur değiştirilemez”*.
- Diğer kurlar düzenlenebilir. Değişiklik yapılınca o satır **Özel** olur.
- **Vazgeç** (✗): O satır için değer ERP’deki orijinal `kurDegeri`’ye döner, düzenleme modundan çıkılır.
- **Onay** (✓): Düzenleme modundan çıkılır; local state’te yeni kur kalır.

### Butonlar

- **Vazgeç:** Dialogu kapatır; local kur listesi temizlenir. Formdaki `exchangeRates` **değişmez**.
- **Kaydet ve Uygula:** `onSave(localRates)` çağrılır; parent’taki `exchangeRates` güncellenir, dialog kapanır.

### Kayıtlı teklif (detay/düzenleme) – Kurlar dialogu

**Veri kaynağı:** Dialog açıldığında kurlar `GET /api/QuotationExchangeRate/quotation/{quotationId}` ile alınır (gerekirse ERP kurlarıyla birleştirilir; §8.6 kuralları geçerli). Bu veri **açılışta saklanır** (revert için).

- **Kaydet:** Kullanıcı dialogda değerleri değiştirip **Kaydet** derse → `PUT /api/QuotationExchangeRate/update-exchange-rate-in-quotation` atılır. **Body:** `List<QuotationExchangeRateGetDto>` (güncellenmiş kur listesi). Başarılı yanıt gelirse local state güncellenir, dialog kapanır.
- **İptal / Kapat:** Kullanıcı **İptal** der veya dialogu **kapatırsa** → Veriler **çekilen hale** getirilir; yani `GET /api/QuotationExchangeRate/quotation/{quotationId}` ile açılışta alınan değerlere **revert** edilir. `update-exchange-rate-in-quotation` çağrılmaz; local kur listesi bu orijinal veriyle güncellenir, dialog kapanır.

**Özet:** Kaydet → PUT ile güncelle; İptal/Kapat → çekilen veriye revert, PUT yok.

### Boş / yükleme durumu

- Kurlar yüklenirken loading göstergesi (örn. “Kurlar yükleniyor...”).
- Hiç kur yoksa tabloda “Kur bulunamadı” mesajı.

---

### 8.7. Satır Ekle Tıklanınca Kontroller

**“Satır ekle”** (veya ürün seçip satıra dönüşecek **ürün seçici** akışı) tetiklenmeden önce aşağıdaki kontroller yapılır. **Hepsi sağlanmazsa** satır ekleme dialogu açılmaz / ürün seçici akışı başlamaz.

1. **Müşteri:** CRM veya ERP müşteri seçili olmalı (`potentialCustomerId` veya `erpCustomerCode`).
2. **Satış temsilcisi:** `representativeId` seçili olmalı.
3. **Para birimi:** `currency` seçili ve geçerli olmalı.

Eksik varsa:

- **Toast:** Başlık *“Hata”*, açıklama *“Lütfen müşteri, temsilci ve para birimi seçimlerini yapınız.”*
- Dialog açılmaz; satır eklenmez.

Bu kontrol hem **doğrudan “Satır ekle”** tıklanınca hem de **ürün seçici** (product dropdown/dialog) üzerinden ürün seçilip satıra geçilirken uygulanır. İkisinde de aynı kontroller ve aynı hata mesajı kullanılır.

#### İki satır ekleme akışı

1. **“Satır ekle” butonu:** Boş satır formu açılır. Kullanıcı ürünü form içindeki **ürün seçici** (dropdown / modal) ile seçer; miktar, indirim, KDV girer ve kaydeder.
2. **Ürün seçici (grid / liste) ile:** Kullanıcı önce ürün listesinden seçim yapar. İlişkili stok yoksa tek satır, varsa **bağlı stoklarla** çoklu satır oluşturulur (**§8.10**). Ardından satır formu açılır (ana veya ana+ilişkili); kullanıcı gerekirse düzenleyip kaydeder. Her iki akışta da **§8.7** ön kontrolleri uygulanır.

**Stok ekle penceresi** içindeki miktar kontrolü, iskonto limiti ve bağlı stok mantığının tam açıklaması **§8.13**’te verilir.

---

### 8.8. Miktar Değiştiğinde Yapılan Kontroller ve Hesaplamalar

Satır formunda **miktar (`quantity`)** değiştiğinde aşağıdakiler uygulanır.

### 1. Temel hesaplama

- `quantity` güncellenir, `calculateLineTotals` ile satır yeniden hesaplanır (`lineTotal`, `vatAmount`, `lineGrandTotal`, `discountAmount1`–`3`).

### 2. Fiyat kuralı (PricingRule) kontrolü

- `pricingRules` içinde `stokCode === productCode` olan kural aranır. **Yoksa** bu adım atlanır.
- Varsa `minQuantity` ve `maxQuantity` (yoksa `maxQuantity = ∞`) alınır.

**Miktar `[minQuantity, maxQuantity]` aralığındaysa:**

- Kuraldaki indirimler uygulanır: `discountRate1`, `discountRate2`, `discountRate3` (ve gerekirse `pricingRuleHeaderId`) kuraldan gelir.
- `fixedUnitPrice` varsa: Birim fiyat = kuraldaki `fixedUnitPrice`, para birimi `currencyCode`’a göre hedef paraya çevrilir; indirimler kuraldan.
- `fixedUnitPrice` yoksa: Mevcut `unitPrice` kalır; sadece indirimler kuraldan güncellenir.  
- Sonra `calculateLineTotals` tekrar çağrılır.

**Miktar aralık dışındaysa:**

- `pricingRuleHeaderId` = `null`.
- Birim fiyat ve indirimler **varsayılan** değerlere döner: `mainStockData` (price-of-product / stok kaynaklı) `unitPrice`, `discountRate1`–`3` kullanılır.
- `calculateLineTotals` tekrar çağrılır.

### 3. İlişkili satırlar (related lines)

- Satırda `relatedProductKey` ve `relatedLines` varsa (**bağlı stok**, **§8.10**), **ana ürün miktarı** değişince ilişkili satırların miktarı da güncellenir.
- Her ilişkili satır için: `quantity` = (o ilişkili satıra ait **birim çarpan** veya mevcut `quantity`) × (yeni ana miktar). Birim çarpan, ilişkili stok/satır verisinde tutulur (örn. `temporaryStockData` / `relatedLines` içindeki `quantity`); ana miktar 1 iken ilişkili miktar ne ise o kullanılabilir.
- İlişkili satırların `lineTotal`, `vatAmount`, `lineGrandTotal` kendi güncel `quantity` ve `unitPrice` ile yeniden hesaplanır.

### 4. İndirim input’larının güncellenmesi

- Miktar değişiminden sonra (kural veya varsayılan nedeniyle) `discountRate1`–`3` değişmiş olabilir. **İndirim 1–2–3** input’ları bu yeni değerlerle senkronize edilir.

---

### 8.9. İskonto Değiştiğinde Yapılan Kontroller ve Gösterimler

Satır formunda **indirim 1, 2 veya 3** (`discountRate1`–`3`) değiştiğinde aşağıdakiler uygulanır.

### 1. Hesaplama

- Değişen oranlar güncellenir, `calculateLineTotals` ile satır yeniden hesaplanır (`discountAmount1`–`3`, `lineTotal`, `vatAmount`, `lineGrandTotal`).

### 2. İndirim limiti kontrolü (useDiscountLimitValidation)

- `userDiscountLimits` içinde `erpProductGroupCode` = satır `groupCode` (boş değil; gerekirse trim) olan limit bulunur.
- **Limit yoksa** veya `groupCode` boşsa: `exceedsLimit` = false, `approvalStatus` = 0.

**Limit varsa:**

- `exceedsLimit1` = `discountRate1 > maxDiscount1`
- `exceedsLimit2` = `maxDiscount2` tanımlıysa `discountRate2 > maxDiscount2`, değilse false
- `exceedsLimit3` = `maxDiscount3` tanımlıysa `discountRate3 > maxDiscount3`, değilse false  
- `exceedsLimit` = `exceedsLimit1 || exceedsLimit2 || exceedsLimit3`
- `approvalStatus` = exceedsLimit ise **1**, değilse **0**. Bu değer satır state’inde saklanır (örn. `approvalStatus` alanı).

### 3. UI geri bildirimi

- **`exceedsLimit`** veya **`approvalStatus === 1`** ise:
  - Satır kartında **kırmızı çerçeve** ve kırmızıya çalan arka plan (React Native’de `StyleSheet` ile; örn. `borderColor: 'red'`, uygun arka plan rengi).
  - **“Onay Gerekli”** badge’i gösterilir.
- Bu durumda **kaydet** engellenmez; kullanıcı satırı kaydedebilir. Uyarı sadece görseldir.

### 4. Input davranışı

- İndirim oranları **0–100** aralığında (min 0, max 100).
- Boş veya sadece “.” girilirse geçici olarak 0 kabul edilir; onBlur’da 0’a çekilip input “0” ile güncellenir.

---

### 8.10. Bağlı Stok Mantığı (İlişkili Ürünler)

Ürünün `StockGetDto.parentRelations` (StockRelationDto[]) ile **ilişkili stoklar**ı varsa, ana ürünle birlikte **çoklu satır** oluşturulur. Aşağıdaki kurallar uygulanır.

#### Kaynak

- **parentRelations:** Her öğe `relatedStockId`, `quantity` (ana ürün başına ilişkili miktar) içerir.
- Ürün seçilirken ilişkili stoklar listelenebilir; kullanıcı **ana ürünü** seçince **ilişkilerle birlikte** ekleme akışı tetiklenir.

#### Ürün seçimi ve satır oluşturma (handleProductSelectWithRelatedStocks)

1. **İstekler:** Her `relatedStockId` için `GET /api/Stock/{id}` → `erpStockCode`, `grupKodu`, `stockName`. Ana + tüm ilişkili `productCode` / `groupCode` ile tek seferde `GET /api/quotation/price-of-product` batch (request[0] ana, request[1]… ilişkili).
2. **Ortak alanlar:** Tüm satırlarda aynı `relatedProductKey` (UUID). `relatedStockId` = ana stok `id` (product.id). İlişkili satırlarda `isMainRelatedProduct` = false, ana satırda true.
3. **Ana satır (i = 0):** `productCode`, `productName`, `groupCode` ürün seçiminden; `quantity` 1; fiyat ve indirimler `PriceOfProductDto` + kur dönüşümü.
4. **İlişkili satırlar (i > 0):** `productCode` = ilişkili `erpStockCode`, `productName` = ilişkili `stockName`, `groupCode` = ilişkili `grupKodu`; `quantity` başta 1 (veya `StockRelationDto.quantity` kullanılabilir); fiyat/indirim yine price-of-product + kur.

#### Kaydetme

- Ana + tüm ilişkili satırlar **tek seferde** `onSaveMultiple([ana, ...ilişkili])` ile eklenir. Tabloda hepsi ayrı satır olarak görünür.

#### Düzenleme

- **Sadece ana satır** (`isMainRelatedProduct === true`) düzenlenebilir. İlişkili satırlara tıklanınca düzenleme **açılmaz**.
- Düzenleme açıldığında ana satır + **relatedLines** (aynı `relatedProductKey`’e sahip diğer satırlar) birlikte formda gösterilir. İlişkili satırlar **salt okunur** (miktar, birim fiyat vb. gösterilir); sadece ana miktar değiştirilir, ilişkili miktarlar **§8.8** kurallarına göre güncellenir.

#### Silme (oluşturma ekranı – yerel)

- Ana veya ilişkili satırlardan **herhangi biri** silinmek istendiğinde, aynı `relatedProductKey`’e sahip **tüm satırlar** (ana + ilişkili) **birlikte** kaldırılır. API çağrısı yok; sadece yerel liste güncellenir.
- Silme öncesi **onay dialogu** açılır; “X kalem silinecek” vb. bilgi verilir. **Kayıtlı** satır silme (detay/düzenleme, API ile) **§8.11**.

#### Miktar güncellemesi

- Ana miktar değişince ilişkili satırların miktarı **§8.8**’deki gibi güncellenir (birim çarpan × yeni ana miktar). Oran, düzenleme sırasında `updatedLine.quantity / originalLine.quantity` ile hesaplanıp diğer ilişkili satırlara uygulanabilir.

Miktar, iskonto ve bağlı stok dahil **stok ekle penceresinin** tüm kontrollerinin detaylı özeti **§8.13**’te verilir.

---

### 8.11. Kayıtlı Satır Silme (Detay / Düzenleme Ekranı)

**Kayıtlı stok** alanında (teklif kaydedildikten sonraki ekranda) bir satır için **“Stoğu sil”** denildiğinde aşağıdaki akış uygulanır.

#### Onay dialogu metni

- **Bağlı stok** ise (`relatedProductKey` dolu, ilgili satır grubu var):  
  *“Bağlı stoğu silmek istediğinize emin misiniz?”*
- **Bağlı stok değilse:**  
  *“Bu stoğu silmek istediğinize emin misiniz?”*

#### Kullanıcı “Evet” derse

1. **İstek:** `DELETE /api/QuotationLine/{id}` atılır. `{id}` = silinecek satırın `id` değeri (QuotationLine id).
2. **Başarılı yanıt geldiyse:** Hem o satır hem de **`relatedProductKey`** değeri aynı olan **tüm satırlar** yerel listeden **kaldırılır**. Yani bağlı stok grubu varsa gruptaki tüm kalemler listeden silinir; tek satırsa yalnızca o satır kaldırılır.
3. **Hata** (4xx / 5xx vb.): Uygun hata mesajı (örn. toast) gösterilir; liste **değişmez**.

**Özet:** Kayıtlı satır silmede onay metni bağlı stok / tek stok için farklıdır; onayda `DELETE /api/QuotationLine/{id}` çağrılır, başarıda o satır ve aynı `relatedProductKey`’e sahip kalemler listeden kaldırılır.

---

### 8.12. Onaya Gönder (TL, Birim 1, Kur Çarpımı)

**Onaya gönder** işlemi **daima TL** bazında düşünülür; gönderilen tutarın birimi **1** (TL) kabul edilir.

- **API:** `POST /api/quotation/start-approval-flow`  
  **Body:** `{ entityId: number; documentType: number; totalAmount: number }`.  
  `entityId` = teklif id, `documentType` = Quotation = **2** (PricingRuleType).

- **`totalAmount` hesabı:**  
  - Teklif para birimi **TL** (ör. TRY, `dovizTipi` 1) ise: `totalAmount = grandTotal`.  
  - Teklif para birimi **TL değilse:** `totalAmount = grandTotal × kur`. **Kur** = teklifin para birimi (`currency` / `dovizTipi`) için `findExchangeRateByDovizTipi(currency, exchangeRates, erpRates)` ile alınan değer. Yani **döviz ile çarpıp** TL karşılığı bulunur; bu değer gönderilir.

- **Unutulmaması gereken:** Onaya gönderirken tutar **mutlaka TL’ye çevrilerek** gönderilir. Döviz cinsinden `grandTotal`’ı kur ile çarpmayı atlama.

**Özet:** Onaya gönder = **TL**, birim **1**. `totalAmount` her zaman TL; değilse `grandTotal × kur` uygula.

---

### 8.13. Stok Ekle Penceresi – Kontroller ve Mantık (Detaylı Özet)

Bu bölüm, **stok ekle / satır ekle** penceresinin (modal veya ekran) nasıl çalıştığını, **miktar**, **iskonto** ve **bağlı stok** mantığını tek yerde toplu ve adım adım açıklar. §8.7–§8.10 ile uyumludur; implementasyon detayları burada netleştirilir.

#### 8.13.1. Genel akış ve pencerenin açılması

- **İki giriş:** (1) **“Satır ekle”** → boş satır formu açılır; kullanıcı **Stok Seç** ile ürün seçer. (2) **Ürün seçici** (dropdown / grid) → doğrudan ürün seçilir; ilişkili stok yoksa tek satır, varsa bağlı stoklarla çoklu satır oluşturulur, ardından form açılır.
- **Ön koşul:** Her iki durumda da **§8.7** kontrolleri uygulanır. Müşteri, temsilci veya para birimi eksikse form/dialog **açılmaz**; toast: *“Lütfen müşteri, temsilci ve para birimi seçimlerini yapınız.”*
- Form açıldıktan sonra: stok seçimi, miktar, birim fiyat (genelde salt okunur), indirim 1–2–3, KDV oranı, hesaplama alanları ve varsa **Bağlı Stoklar** bloğu gösterilir. Kaydet / İptal ile kapanır.

#### 8.13.2. Miktar kontrol mantığı (detaylı)

**A. Temel hesaplama**

- `quantity` değiştiği anda satır `calculateLineTotals` ile yeniden hesaplanır: `lineTotal`, `vatAmount`, `lineGrandTotal`, `discountAmount1`–`3`.
- Miktar input’u: `min` 0.01, `step` 0.001. Boş veya sadece `"."` geçici olarak 0 kabul edilir; `onBlur`’da 0’a çekilip input `"0"` ile güncellenir.

**B. Fiyat kuralı (PricingRule) – miktar aralığı**

- **Kaynak:** `pricingRules` (`GET /api/quotation/price-rule-of-quotation`), satır `productCode` ile eşleşen `stokCode` aranır.
- **Yoksa:** Bu adım atlanır; birim fiyat ve indirimler mevcut (örn. price-of-product) değerlerde kalır.

**Varsa:**

- `minQuantity`, `maxQuantity` (tanımlı değilse `maxQuantity = ∞`) alınır.
- **Miktar `[minQuantity, maxQuantity]` aralığındaysa:**
  - `discountRate1`, `discountRate2`, `discountRate3` (ve gerekirse `pricingRuleHeaderId`) **kuraldan** gelir.
  - `fixedUnitPrice` **varsa:** Birim fiyat = kuraldaki `fixedUnitPrice`; `currencyCode`’a göre hedef paraya çevrilir. İndirimler yine kuraldan.
  - `fixedUnitPrice` **yoksa:** Mevcut `unitPrice` kalır; sadece indirimler kuraldan güncellenir.
  - Ardından `calculateLineTotals` tekrar çağrılır.
- **Miktar aralık dışındaysa:**
  - `pricingRuleHeaderId` = `null`.
  - Birim fiyat ve indirimler **varsayılana** döner: `mainStockData` (price-of-product / stok kaynaklı) `unitPrice`, `discountRate1`–`3` kullanılır.
  - `calculateLineTotals` tekrar çağrılır.

**C. Bağlı stoklar için miktar güncellemesi**

- Satır **bağlı stok** grubundaysa (`relatedProductKey` dolu, `relatedLines` mevcut) ve **ana ürün** (`isMainRelatedProduct === true`) ise, **sadece ana miktar** kullanıcı tarafından değiştirilir.
- Her **ilişkili** satır için bir **birim çarpan** (ana miktar 1 iken ilişkili miktar) saklanır. Bu değer:
  - **Yeni eklemede:** Başta 1 (veya `StockRelationDto.quantity` kullanılıyorsa o). İlişkili satırlar `quantity = 1` (veya ilgili oran) ile oluşturulur.
  - **Düzenlemede (mevcut satırdan yükleme):** `birimÇarpan = ilişkiliSatır.quantity / anaSatır.quantity`.
- **Ana miktar değişince:** Her ilişkili satır için `yeniİlişkiliMiktar = birimÇarpan × yeniAnaMiktar`. İlişkili satırların `lineTotal`, `vatAmount`, `lineGrandTotal` kendi güncel `quantity` ve `unitPrice` ile `calculateLineTotals` ile yeniden hesaplanır.
- İlişkili satırların miktarı **formda salt okunur**; kullanıcı yalnızca ana miktarı değiştirir.

**D. Miktar değişiminden sonra indirim input’ları**

- Kural veya varsayılan nedeniyle `discountRate1`–`3` değişmiş olabilir. İndirim 1–2–3 input’ları bu yeni değerlerle senkronize edilir.

#### 8.13.3. İskonto (indirim) kontrol mantığı (detaylı)

**A. Veri kaynağı**

- **`userDiscountLimits`:** `GET /api/UserDiscountLimit/salesperson/{salespersonId}` ile gelir. `UserDiscountLimitDto`: `erpProductGroupCode`, `maxDiscount1`, `maxDiscount2?`, `maxDiscount3?`.
- Satır `groupCode` (ürün grubu) ile eşleşen limit bulunur: `erpProductGroupCode === groupCode` (boş değil; trim uygulanabilir).

**B. Limit yoksa**

- `groupCode` boş veya eşleşen limit yoksa: `exceedsLimit` = false, `approvalStatus` = 0. Ek işlem yok.

**C. Limit varsa – karşılaştırma**

- `exceedsLimit1` = `discountRate1 > maxDiscount1`
- `exceedsLimit2` = `maxDiscount2` tanımlıysa `discountRate2 > maxDiscount2`, değilse false
- `exceedsLimit3` = `maxDiscount3` tanımlıysa `discountRate3 > maxDiscount3`, değilse false
- `exceedsLimit` = `exceedsLimit1 || exceedsLimit2 || exceedsLimit3`
- `approvalStatus` = `exceedsLimit` ise **1**, değilse **0**. Bu değer satır state’inde (`approvalStatus` alanı) tutulur.

**D. UI geri bildirimi**

- **`exceedsLimit`** veya **`approvalStatus === 1`** ise:
  - Satır kartında **kırmızı çerçeve** ve kırmızıya çalan arka plan.
  - **“Onay Gerekli”** badge’i gösterilir.
- **Kaydet engellenmez.** Uyarı sadece görseldir; kullanıcı satırı kaydedebilir.

**E. İndirim input davranışı**

- İndirim oranları **0–100** aralığında (min 0, max 100).
- Boş veya sadece `"."` girilirse geçici olarak 0 kabul edilir; `onBlur`’da 0’a çekilip input `"0"` ile güncellenir.

#### 8.13.4. Bağlı stok seçim mantığı (stok seçilince)

Ürün seçicide **bağlı stoğu olan** bir stok seçildiğinde, önce **hangi bağlı stokların** ekleneceği kullanıcıya sorulur. Bu akış aşağıdaki gibi uygulanır.

**A. Tetikleme**

- Kullanıcı ürün seçicide (dropdown / grid / liste) bir **ana stok** seçer.
- Stokta `parentRelations` (veya eşdeğeri) varsa ve **bağlı stok seçimi etkin** ise (`disableRelatedStocks !== true`):
  - Ürün seçici **kapanır**.
  - Seçilen ana stok geçici olarak saklanır (`selectedStock`).
  - **“Bağlı Stokları Seçin”** dialogu açılır; `relatedStocks` = `parentRelations` (`StockRelationDto[]`).
- Bağlı stok **yoksa** veya seçim **devre dışı** ise: Doğrudan `onSelect({ id, code, name, groupCode })` çağrılır; tek satır akışı (**§8.13.5.B** olmadan) devam eder.

**B. Dialog içeriği ve veri**

- **Başlık:** “Bağlı Stokları Seçin”
- **Açıklama:** “Ana stok ile birlikte eklemek istediğiniz bağlı stokları seçin. Zorunlu stoklar otomatik olarak seçilidir.”
- Liste `StockRelationDto` alanlarıyla gösterilir: `relatedStockId`, `relatedStockCode`, `relatedStockName`, `quantity` (ana ürün başına), `isMandatory`, `description`.

**C. Zorunlu / opsiyonel ayrımı**

- **Zorunlu stoklar** (`isMandatory === true`): Ayrı blokta listelenir. **Checkbox** hep işaretli ve **disabled**; kullanıcı kaldıramaz. Badge: “Zorunlu”.
- **Opsiyonel stoklar** (`isMandatory === false`): Ayrı blokta listelenir. **Checkbox** ile açılışta **işaretsiz**; kullanıcı isterse işaretleyip ekler, isterse bırakır.

**D. Açılışta seçili ID’ler**

- Dialog açıldığında `selectedStockIds` (veya eşdeğeri) **sadece zorunlu** `relatedStockId` değerleriyle doldurulur.
- Opsiyonel stoklar başlangıçta seçili **değildir**.

**E. Kullanıcı etkileşimi**

- Opsiyonel bir satıra tıklanınca (veya checkbox değişince) o `relatedStockId` seçime **eklenir** veya **çıkarılır**. Zorunlu stoklarda toggle **yapılmaz**.
- Her bağlı stok satırında `quantity` ve varsa `description` gösterilir.

**F. İptal**

- **İptal** veya dialog **dışına tıklayıp kapatma:** Dialog kapanır, `selectedStock` temizlenir. **Ana ürün seçimi iptal** sayılır; satır eklenmez. Ürün seçici yeniden açılabilir (implementasyona göre).

**G. Onayla / Ekle**

- **Ekle** (veya Onayla) tıklanınca: `onConfirm(selectedStockIds)` çağrılır. `selectedStockIds` = o an seçili olan tüm `relatedStockId` değerleri (zorunlular + kullanıcının işaretlediği opsiyoneller).
- Ardından `onSelect({ id, code, name, groupCode, relatedStockIds: selectedStockIds })` ile ana stok + seçilen bağlı stok ID’leri **teklif tarafına** iletilir. Dialog kapanır, `selectedStock` temizlenir.
- Bu noktada **çoklu satır** akışı tetiklenir: `handleProductSelectWithRelatedStocks(product, relatedStockIds)` (**§8.13.5.B**).

**H. Sıra notu**

- `selectedStockIds` dizisinin **sırası** implementasyona bırakılır. Öneri: Önce zorunlular (`parentRelations` sırasına uygun), sonra seçilen opsiyoneller aynı sırayla; böylece `StockRelationDto.quantity` ile eşleme kolaylaşır.

**Özet (seçim mantığı):** Stok seç → bağlı varsa dialog aç → zorunlular sabit, opsiyoneller toggle → İptal = seçim iptal, Ekle = `relatedStockIds` ile çoklu satır akışı.

---

#### 8.13.5. Bağlı stok mantığı (satır oluşturma, düzenleme, silme)

**A. Kaynak ve tetikleme**

- Stok `StockGetDto.parentRelations` (veya eşdeğeri) ile **ilişkili stoklar** tanımlıdır. `StockRelationDto`: `relatedStockId`, `quantity` (ana ürün başına ilişkili miktar), `isMandatory` vb.
- **§8.13.4**’teki seçim sonrası `onSelect` ile gelen `relatedStockIds` (ve isteğe bağlı olarak `StockRelationDto.quantity`) **çoklu satır** oluşturma akışını tetikler.

**B. Ürün seçimi ve satır oluşturma (`handleProductSelectWithRelatedStocks`)**

1. Ana + her `relatedStockId` için `GET /api/Stock/{id}` → `erpStockCode`, `grupKodu`, `stockName`.
2. Tüm `productCode` / `groupCode` ile **tek seferde** `GET /api/quotation/price-of-product` batch çağrılır.
3. Tüm satırlarda ortak: `relatedProductKey` (UUID), `relatedStockId` = ana stok id. Ana satırda `isMainRelatedProduct` = true, ilişkililerde false.
4. **Ana satır (i = 0):** `productCode`, `productName`, `groupCode` seçimden; `quantity` 1; fiyat/indirim `PriceOfProductDto` + kur dönüşümü.
5. **İlişkili satırlar (i > 0):** `productCode` = ilişkili `erpStockCode`, `productName` = ilişkili `stockName`, `groupCode` = ilişkili `grupKodu`; `quantity` başta 1 veya `StockRelationDto.quantity` (ana başına oran). Fiyat/indirim yine price-of-product + kur.

**C. Birim çarpanın saklanması ve kullanılması**

- Form tarafında (örn. `temporaryStockData` benzeri) her ilişkili satır için **birim çarpan** tutulur: ana miktar 1 iken o ilişkili satırın miktarı. Yeni eklemede 1 (veya `StockRelationDto.quantity`); düzenlemede `relatedLine.quantity / mainLine.quantity`.
- Ana miktar değişince ilişkili miktarlar **birim çarpan × yeni ana miktar** ile güncellenir (§8.13.2.C).

**D. Kaydetme**

- Ana + tüm ilişkili satırlar **tek seferde** `onSaveMultiple([ana, ...ilişkili])` ile kaydedilir. Tabloda hepsi ayrı satır olarak görünür.

**E. Düzenleme**

- **Sadece ana satır** düzenlenebilir. İlişkili satıra tıklanınca düzenleme açılmaz.
- Düzenleme açıldığında ana satır + aynı `relatedProductKey`’e sahip ilişkili satırlar (`relatedLines`) birlikte gösterilir. İlişkili satırlar **salt okunur**; sadece ana miktar değiştirilir, ilişkili miktarlar **§8.13.5.C** kuralına göre güncellenir.

**F. Silme**

- Ana veya ilişkili satırlardan herhangi biri silinmek istendiğinde, aynı `relatedProductKey`’e sahip **tüm satırlar** birlikte kaldırılır. Önce onay dialogu (örn. “X kalem silinecek” / “Bağlı stoğu silmek istediğinize emin misiniz?”); onayda yerel liste güncellenir. Kayıtlı teklifte silme **§8.11**.

**Özet (Stok Ekle penceresi):** Ön kontrol → müşteri/temsilci/para birimi. Miktar → temel hesaplama + fiyat kuralı aralığı + bağlı stok birim çarpan. İskonto → grup bazlı limit, “Onay Gerekli” gösterimi, kaydet serbest. Bağlı stok **seçim** → **§8.13.4** (dialog, zorunlu/opsiyonel). Bağlı stok **satır** → çoklu satır, ortak `relatedProductKey`, sadece ana düzenlenir, miktar oranıyla güncellenir, silmede tüm grup kalkar.

---

## 9. Hesaplamalar

- **Satır (calculateLineTotals):**  
  `base = quantity * unitPrice`. İndirimler **zincirleme** uygulanır:  
  `current = base` → `current -= current * (discountRate1/100)` → `current -= current * (discountRate2/100)` → `current -= current * (discountRate3/100)` → `lineTotal = max(0, current)`.  
  `vatAmount = lineTotal * (vatRate/100)`, `lineGrandTotal = lineTotal + vatAmount`.  
  `discountAmount1`–`3` ayrıca hesaplanır (indirim tutarları).
- **Özet:** Tüm satırların `lineTotal`, `vatAmount`, `lineGrandTotal` toplamları; özet kartında gösterilir.

---

## 10. Mimari (Mobile)

- Feature-first: `api/`, `hooks/`, `screens/`, `components/`, `types/`.
- Screen: sadece UI; API, navigation, state yok.
- Hook: API, validasyon, navigation, hesaplama.
- Liste: **FlatList**; `map` ile liste yasak. Sayfalı listelerde **scroll tabanlı pagination** (**§2.5**): infinite scroll, `onEndReached`, `hasNextPage`, biriken `data`.
- State: server → TanStack Query; form → React Hook Form + Zod.
- Style: `StyleSheet.create`; inline yok.
- Navigation: sadece hook içinde.

### 10.1. Modül Parçalama (Feature Split)

Teklif (quotation) işlevi **özellik bazlı** modüllere ayrılmıştır. Her modül kendi `api/`, `hooks/`, `types/`, gerektiğinde `schemas/` ve `utils/` altında yaşar; başka feature’dan doğrudan import **yasaktır**, sadece `index.ts` barrel export üzerinden erişilir.

| Modül | Sorumluluk | İçerik |
|-------|------------|--------|
| **quotation-list** | Teklif listesi, revizyon oluşturma | Listeleme API’si, `getList`, `createRevisionOfQuotation`, kendi types/hooks/utils. |
| **quotation-create** | Yeni teklif oluşturma (bu promptun konusu) | Create sayfası, `bulk-quotation` ve create akışına ait tüm API’ler, DTO’lar, hook’lar, form/schema. |
| **quotation-detail** | Kayıtlı teklif detayı ve düzenleme | Detay API’leri, satır/kur CRUD, `by-quotation`, `create-multiple`, `update-exchange-rate-in-quotation` vb. |
| **quotation** (ortak) | Paylaşılan UI + Onay Bekleyenler | Ortak bileşenler (ExchangeRateDialog, QuotationHeaderForm, QuotationLineTable, QuotationSummaryCard, QuotationLineForm, QuotationExchangeRateForm), WaitingApprovals sayfası ve kendi api/hooks. |

**Kurallar:**

- **quotation-create** (mobile): Tüm create ekranı mantığı `quotation-create` feature’ı altında olmalı; kendi `api/`, `hooks/`, `types/`, `schemas/`, `utils/` kullanılır. Ortak UI bileşenleri `quotation` (ortak) modülünden barrel export ile alınır.
- **quotation-detail**: Kayıtlı teklifte satır ekleme, satır silme, kurlar güncelleme kendi API/hook’larında; create ile API paylaşımı yok.
- **quotation-list**: Sadece listeleme ve revizyon oluşturma; create/detail API’leri kullanılmaz.
- Her modülde **staleTime** ve query key’ler o modüle özel tanımlanır; global default kullanılmaz.

Bu parçalama hem web hem mobile codebase’te aynı mantıkla uygulanır; bu prompt ile yazılacak Quotation Create (mobile) ekranı, `quotation-create` modülü sınırları içinde ve ortak `quotation` bileşenleriyle implemente edilir.

---

## 11. Özet API Listesi

```
GET  /api/Quotation/related-users/{userId}
GET  /api/PaymentType?pageNumber=1&pageSize=1000&sortBy=Name&sortDirection=asc
GET  /api/Erp/getExchangeRate?tarih=YYYY-MM-DD&fiyatTipi=1
GET  /api/Customer?pageNumber=1&pageSize=1000&sortBy=Name&sortDirection=asc
GET  /api/Erp/getAllCustomers (?cariKodu=...)
GET  /api/Customer/{id}
GET  /api/ShippingAddress/customer/{customerId}
GET  /api/DocumentSerialType/avaible/customer/{customerTypeId}/salesrep/{salesRepId}/rule/2
GET  /api/quotation/price-rule-of-quotation?customerCode=...&salesmenId=...&quotationDate=...
GET  /api/UserDiscountLimit/salesperson/{salespersonId}
GET  /api/quotation/price-of-product?request[0].productCode=...&request[0].groupCode=...
GET  /api/Stock/{id}
GET  /api/Stock?page=...&pageSize=...
POST /api/quotation/bulk-quotation  Body: QuotationBulkCreateDto
GET  /api/QuotationLine/by-quotation/{quotationId}   Kayıtlı teklif satırları (§3.6.1)
POST /api/QuotationLine/create-multiple  Body: CreateQuotationLineDto[]   Kayıtlı teklifte satır ekleme (§3.6.2)
GET  /api/QuotationExchangeRate/quotation/{quotationId}   Kayıtlı teklif döviz kurları (§3.6.1)
PUT  /api/QuotationExchangeRate/update-exchange-rate-in-quotation  Body: List<QuotationExchangeRateGetDto>  Kurlar dialog Kaydet (kayıtlı teklif); §8.6
POST /api/quotation/start-approval-flow  Body: { entityId, documentType: 2, totalAmount }  totalAmount TL; değilse grandTotal×kur (§8.12)
DELETE /api/QuotationLine/{id}   Kayıtlı satır silme (detay/düzenleme); §8.11
```

---

## 12. Ek Notlar

- **PricingRuleType.Quotation** = 2.
- **customerCode:** CRM’de `CustomerDto.customerCode`, ERP’de `erpCustomerCode`.
- Seri no: ERP müşteride `customerTypeId` = 0 kabul edilir.
- **Kur kaynağı önceliği:** `findExchangeRateByDovizTipi(currencyKey, exchangeRates, erpRates)` — ilk parametre para birimi anahtarı (`dovizTipi` number veya `currency` string); önce **teklif kurları** (`exchangeRates`, kurlar dialogundan), yoksa **ERP kurları** (`getExchangeRate`) aranır. Döviz dönüşümü ve kur değişiminde bu sıra kullanılır.
- **QuotationExchangeRateFormState** (kurlar dialogu / dönüşüm): `id`, `currency`, `exchangeRate`, `exchangeRateDate`, `isOfficial`, `dovizTipi`. Create’te `exchangeRates` bu yapıda tutulur; POST’ta `QuotationExchangeRateCreateDto`’ya map edilir (`id` / `dovizTipi` gönderilmez).

**Geri / İptal:** Header’daki geri butonu ve form altındaki “İptal” ile `navigate(-1)` (bir önceki ekrana dön). Sayfa başlığı “Yeni Teklif Oluştur”.

**Toast mesajları özeti:**  
- Hata (genel): *“Hata”* / *“Lütfen müşteri, temsilci ve para birimi seçimlerini yapınız.”* (§8.7).  
- Submit: müşteri eksik *“Lütfen müşteri seçiniz.”*; satır yok *“En az 1 satır eklenmelidir.”*; ödeme tipi *“Ödeme tipi seçilmelidir.”*; teslim tarihi *“Teslimat tarihi girilmelidir.”*; para birimi *“Geçerli bir para birimi seçilmelidir.”*; validasyon *“Lütfen form alanlarını kontrol ediniz.”*; API hatası → `result.message` veya *“Teklif oluşturulurken bir hata oluştu.”*  
- **Kaydet sonrası:** Başarı toast’ı → yönlendirme; hata toast’ı → create’te kalma. Ayrıntı ve **sonraki adım** **§3.8**.
- Kurlar dialog: *“Kullanımda olan kur değiştirilemez.”*

Bu doküman **tek başına** kullanılarak, dropdown + search + sesli komut kuralları, **bağlı stok**, **döviz değişimi** ve **tam DTO içerikleri** dahil, sıfırdan Quotation Create ekranı implemente edilebilir.
