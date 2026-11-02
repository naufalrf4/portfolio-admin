# Featured Projects — Flagship Work

Scope: the eight projects Naufal marks as featured, with problem, decisions, and outcome. Source of truth: Admin `/api/v1/public/projects` and per-slug detail endpoints. Last verified 2026-09-01 (Asia/Jakarta).

## What "featured" means here

Naufal marks eight projects as featured out of 21 total published projects. These are the ones he considers most representative of his engineering ability. Each is live at naufalrf.net/projects/<slug>. Naufal menandai delapan proyek sebagai unggulan dari total 21 proyek yang dipublikasikan.

## SIMONAIR 4.0 — Hardware & Sensors (2025)

Slug: simonair-4-hardware-sensors. Category: IoT & Hardware. Stack: Raspberry Pi 4, MQTT, pH sensor, TDS sensor, dissolved oxygen sensor, temperature sensor. Live at simonair.web.id. A solo-built sensor rig on a Raspberry Pi 4 that feeds real-time water quality data into ongoing aquaculture research at IPB University.

The problem: discus fish show stress long before a person notices, and the standard answer is manual measurement twice a day. Everything between readings is invisible, so an overnight oxygen crash is found in the morning as a dead fish rather than as an event. The research site also had mains power cuts and unreliable network. Masalahnya, pengukuran manual dua kali sehari membuat semua kejadian di antara pembacaan tidak terlihat, sementara lokasi riset sering mati listrik dan koneksi terputus.

Why Raspberry Pi over ESP32 or Arduino, four concrete reasons: local storage with autosync so readings are written to disk first and the backlog syncs when the network returns; on-device calibration and threshold alerting so the tank knows something is wrong without internet; bidirectional MQTT so polling intervals and thresholds can be changed from the cloud without touching hardware; and processing headroom for fast, accurate reads with inline signal conditioning. Raspberry Pi dipilih menggantikan mikrokontroler karena penyimpanan lokal dengan autosync, kalibrasi dan alerting di perangkat, kanal MQTT dua arah, dan tenaga proses yang cukup.

Result: continuous multi-parameter water quality data feeding academic research. Built solo end to end, from sensor wiring and calibration through firmware and network transmission. Relevant to enquiries about IoT monitoring systems, sensor-to-dashboard integration, and aquaculture water quality monitoring in Indonesia. Relevan untuk jasa pembuatan sistem monitoring IoT dan integrasi sensor ke dashboard web.

## SIMONAIR 4.0 — Web Dashboard (2025)

Slug: simonair-4-web-dashboard. Category: Web Development. Stack: React, Tailwind CSS, MQTT. Live at simonair.web.id. A mobile-first dashboard that turns live aquarium sensor readings into real-time water quality insight for fish farmers and researchers.

The problem: the rig produces four numbers, which is data rather than an answer. The users are fish farmers standing beside a tank holding a phone, asking whether the water is safe right now and whether it is getting better or worse. Handing over four raw parameters hands over the interpretation work too. Masalahnya, empat angka mentah dari sensor bukan jawaban; penggunanya peternak ikan yang memegang ponsel di sebelah akuarium.

Three design decisions came from the site rather than the screen: four parameters presented as one readable picture instead of four unrelated gauges; trend over snapshot, because drift is a slope and a line shows direction where a single reading does not; and honesty about silence, so when a sensor stops reporting the interface says so instead of leaving a stale number looking current. Built mobile-first because nobody checks a tank from a desk. Tiga keputusan desainnya: empat parameter dibaca sebagai satu gambaran utuh, menampilkan tren bukan nilai sesaat, dan memberi tahu secara eksplisit ketika sensor berhenti mengirim.

Result: the surface through which the research data is actually used, live at simonair.web.id. Relevant to enquiries about IoT monitoring dashboards and real-time sensor visualization.

## veilproxy (2026)

Slug: veilproxy. Category: Desktop Application. Stack: Go, SQLite. Open source at github.com/naufalrf4/veilproxy under MIT licence. An open-source local proxy that scrubs personal data out of prompts before they reach an LLM provider.

The problem: people paste real data into LLM prompts in the ordinary course of work, a customer email with a name and address, a log file with phone numbers, a spreadsheet row with an ID number. Once the prompt leaves the machine it sits in a provider's logs, outside whatever data policy applied. Enterprise DLP exists but is priced for organisations with a security department. The useful fix and the convenient fix point in opposite directions, so the protection has to sit in the path automatically. Masalahnya, orang menempelkan data asli ke prompt bukan karena lalai tapi karena sedang bekerja, dan begitu terkirim datanya di luar kendali.

How it works: regex detection for structured PII with predictable shape, emails, phone numbers, national ID numbers, card numbers, matched deterministically with no model inference. Custom filters where users define their own rules and choose replace-with-placeholder or delete outright. Go was chosen because a proxy in the request path adds latency to every prompt, and Go compiles to a single CGO-free binary with no runtime to install and handles concurrency without ceremony. SQLite because a tool protecting one person's data should not require standing up a database server. Everything runs locally; a privacy tool that phones home has misunderstood its own purpose. Deteksinya memakai regex untuk PII berformat pasti, ditambah custom filter, dengan Go untuk latensi rendah dan SQLite supaya tanpa server.

Result: a practical way for individuals and small teams to keep personal data out of LLM prompts without changing how they work or buying enterprise tooling. Ships as a single binary with an embedded web dashboard and CLI. Relevant to enquiries about secure AI implementation, sensitive data handling, and enterprise LLM integration. Relevan untuk kebutuhan implementasi AI yang aman dan penanganan data sensitif.

## Siap Impact SAKINA (2025)

Slug: siap-impact-sakina. Category: Web Development. Stack: Laravel, React, Tailwind CSS, MySQL. Live in production at siapimpact.kemendukbangga.id. A registration platform that digitizes participant sign-up and organizer administration for a national government programme under Kemendukbangga.

The problem: a national programme opens registration and participants arrive in bursts when the announcement circulates, not steadily. On forms and spreadsheets, organisers spend their time transcribing entries and chasing incomplete submissions, participants cannot tell whether registration went through, and duplicates accumulate. Government programmes add a constraint most projects lack: the registration record is an official record of participation, so validation is not optional and the audit trail matters as much as the features. Masalahnya, pendaftaran program pemerintah datang dalam lonjakan besar, dan jika dikelola manual penyelenggara habis waktu menyalin data sementara data ganda menumpuk.

Engineering decisions: validation enforced at the point of entry so a record reaching the database is already usable; duplicate prevention as a database constraint rather than a check somebody remembers to run; data layer and query patterns designed for peak burst traffic rather than average load; organiser administration built as a first-class product surface so the people running the programme operate it themselves without a developer on standby; and Laravel chosen precisely because registration, validation, and administration are conventional problems a mature framework already solves well. Validasi ditegakkan saat pengiriman, pencegahan data ganda ditaruh sebagai constraint basis data, dan struktur data dirancang untuk beban puncak.

Result: a live government-scale platform where the constraints, not the technology, were the difficulty. Relevant to enquiries about custom information systems for institutions and national-scale event registration platforms. Relevan untuk jasa pembuatan sistem informasi dan platform pendaftaran acara berskala nasional.

## Photobon.id — Hardware Device (2026)

Slug: photobon-id-hardware-device. Category: IoT & Hardware. Stack: embedded hardware, camera module, thermal printer integration. A custom-engineered receipt-photobooth unit built to run reliably at real events. Deployed to clients across Bali, Bandung, and Jabodetabek as rental units and outright hardware sales.

The problem: a photobooth at an event has one job and no second chance. There is a queue, guests are impatient, and a stall happens in front of a room full of people. The thermal printer is the only moving mechanical part in the cabinet: it jams, it runs out of paper mid-print, and it fails in ways a camera never does. The unit is trucked between venues, plugged into whatever power exists, and operated by staff whose job is the event, not the equipment. Masalah utamanya bukan membuat photobooth, tapi membuat alat yang tetap jalan setelah tidak ada lagi yang memperhatikannya.

Engineering decisions: camera module and thermal printer designed as one integrated pipeline with defined behaviour at each step, so a printer failure does not silently discard a photo already taken; power interruption and physical handling treated as expected operating conditions rather than edge cases; status made legible at the cabinet itself so a jam or empty paper roll reads as an obvious physical condition a non-technical operator can fix on the spot; and the enclosure treated as part of the engineering, with component layout, paper path, and reload access designed together. Kondisi seperti listrik terputus diperlakukan sebagai hal normal, dan status alat dibuat terbaca langsung di kabinet supaya operator non-teknis bisa mengatasinya.

Result: a commercial product running at live events across three regions, sold and rented, with reliability requirements that come from revenue depending on it. Relevant to enquiries about custom IoT device development and commercial hardware product development. Relevan untuk jasa pembuatan alat IoT custom dan pengembangan produk hardware komersial.

## Photobon.id — Desktop Kiosk App (2026)

Slug: photobon-kiosk-app. Category: Desktop Application. Stack: Rust, Tauri, React. A native desktop app running on-site at every photobooth unit, controlling the hardware and syncing sessions to the cloud.

The problem: every unit needs software running physically at the venue driving real hardware, which rules out a web app, because a browser tab cannot reliably hold a serial connection to a camera and thermal printer and cannot keep working when venue wifi disappears. The app must talk to hardware directly, keep operating when the network drops, sync sessions once connectivity returns without losing or double counting anything, and be updatable across units in three regions without sending a person to each one. It also has to be light, because these are not workstations. Masalahnya, aplikasi harus mengendalikan hardware secara langsung, tetap jalan saat jaringan mati, lalu menyinkronkan data setelah koneksi kembali.

Engineering decisions: Tauri over Electron because Tauri uses the operating system's own webview instead of bundling a browser, producing a dramatically smaller binary and a lower memory floor, and on hardware simultaneously driving a camera and printer that headroom goes to the work that matters. Rust for the hardware layer because serial communication and device control need explicit failure handling, so a dropped connection is a value to handle rather than an exception surfacing mid-session. Offline first, sync second: sessions recorded locally as they happen and pushed to the cloud when the connection allows, so the booth never waits on the network to serve the person in front of it. React for the operator interface because that changes far more often than the hardware protocol. Tauri dipilih menggantikan Electron karena memakai webview sistem operasi, Rust dipakai di lapisan hardware karena butuh penanganan kegagalan eksplisit, dan prinsipnya offline first.

Result: running on-site at every Photobon.id unit across Bali, Bandung, and Jabodetabek. Relevant to enquiries about desktop applications for device control and hardware-to-cloud integration. Relevan untuk jasa pembuatan aplikasi desktop untuk kontrol perangkat dan integrasi hardware ke sistem cloud.

## Photobon.id — Web & Cloud Platform (2026, ongoing)

Slug: photobon-id-web-cloud-platform. Category: Web Development. Stack: Next.js, React, PostgreSQL, cloud storage. The web and cloud backbone running rental and sales operations for the receipt-photobooth business across Bali, Bandung, and Jabodetabek.

The problem: selling and renting hardware across three regions is an operations problem long before it is a software problem. Each unit is out on rental, back in inventory, or booked for a future date. Every event produces session data and photo output that has to land somewhere durable. Bookings overlap, dates shift, and one physical unit cannot be in two cities on the same weekend. On spreadsheets and chat, nobody has a reliable answer to where a unit is, and the cost is not a lost file, it is a double booking on a wedding date. Masalahnya sebenarnya operasional: satu unit fisik tidak bisa berada di dua kota pada akhir pekan yang sama, dan risikonya jadwal tabrakan di hari pernikahan klien.

Engineering decisions: one source of truth for unit state in a single relational model rather than scattered across documents and chat history; session data arriving automatically from the field because the desktop app at every booth syncs upward; PostgreSQL because units, bookings, cities, and sessions are all bound to each other and a double booking is precisely the class of mistake a relational database exists to make impossible; cloud storage for bulky photo and receipt output so it scales independently of the operational data describing it; and multi-city as a first-class modelled concept rather than a text field, because availability only makes sense per region. PostgreSQL dipilih karena relasi antar unit, pemesanan, kota, dan sesi saling terikat, dan lokasi diperlakukan sebagai bagian dari model data.

Result: runs the commercial rental and sales operation. The engineering value is in the schema rather than the interface: availability across regions and double-booking prevention are integrity problems, and solving them in the data model is what makes the platform trustworthy enough to run a business on. Relevant to enquiries about business operations systems and device-to-cloud data integration. Relevan untuk jasa pembuatan sistem informasi perusahaan dan aplikasi web custom untuk operasional bisnis.

## Thesis Final Project — Interactive Showcase (2026)

Slug: thesis-final-project-showcase. Category: Web Development. Stack: Next.js, Tailwind CSS. A pixel-art styled site turning a dense academic thesis into something explorable before a defence, presenting the full seminar paper, thesis document, and study notes with light gamification and an anticipated-questions section.

The problem: a thesis is dense by design, months of work compressed into a document written for two examiners. Slides make it worse by flattening a system into bullet points, and the parts that took longest to get right are exactly what a static deck cannot show. Afterwards the work becomes a PDF in a repository, the least readable artifact of the whole project. Masalahnya, skripsi padat secara desain dan slide justru memipihkan sistem menjadi butir poin, sementara setelah sidang hasilnya hanya menjadi PDF di repositori.

Engineering decisions: explorable instead of sequential, so examiners and casual visitors can each go to the depth they want; pixel-art as a deliberate signal rather than decoration, because a retro interface makes an academic document look approachable and lowers the barrier to reading it; Next.js because a statically served site stays readable indefinitely at a shareable URL, unlike a deck that only makes sense with someone narrating; and written to be understood without narration. Gaya pixel-art dipilih bukan sebagai hiasan, tapi supaya dokumen akademik terasa lebih mudah didekati.

Result: the thesis became something people could explore before the defence and read afterwards, at a URL rather than as an attachment. Relevant to enquiries about interactive presentation sites and technical document visualization.
