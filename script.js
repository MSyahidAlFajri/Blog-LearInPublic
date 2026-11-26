/* =========================================================
   DATA 2 ARTIKEL BLOG (STORYTELLING)
   ========================================================= */
const blogPosts = [
  {
    id: "golang-fiber-microservices-gcp",
    category: "Backend & Microservices",
    date: "8 Februari 2024",
    title: "Membangun Aplikasi Microservices dengan Golang (Go Fiber), Vanilla JS, MongoDB, dan GCP",
    subtitle:
      "Pengalaman pertama memecah layanan backend menggunakan Go Fiber, menghubungkannya ke MongoDB, mendeploy ke Google Cloud Platform, dan mengintegrasikannya dengan Vanilla JavaScript.",
    excerpt:
      "Cerita di balik tantangan membangun arsitektur microservices dari nol: mulai dari routing super cepat di Go Fiber, koneksi MongoDB, kendala CORS di Vanilla JS, hingga deployment di GCP.",
    tags: ["Golang", "Go Fiber", "Microservices", "GCP", "MongoDB", "Vanilla JS"],
    initialClaps: 0,
    content: `
      <p>
        Saat pertama kali mendapat tantangan untuk membuat aplikasi bertema <strong>microservices</strong> menggunakan <strong>Golang</strong>, hal pertama yang terlintas di pikiran saya adalah bagaimana cara memecah fitur aplikasi menjadi layanan-layanan kecil yang mandiri namun tetap cepat saat berkomunikasi. Untuk kerangka kerjanya, saya memilih <strong>Go Fiber</strong> karena sintaksnya yang ringkas (mirip Express.js) dan performanya yang tinggi.
      </p>

      <h2>1. Merancang Arsitektur Layanan &amp; Database MongoDB</h2>
      <p>
        Alih-alih menumpuk seluruh logika ke dalam satu aplikasi monolitik, saya memisahkan layanan API berdasarkan domain tugasnya (misalnya layanan autentikasi dan layanan manajemen data utama). Untuk penyimpanan datanya, saya menggunakan <strong>MongoDB</strong> karena fleksibilitas struktur dokumen JSON-nya sangat cocok dengan respons REST API yang dikirimkan ke frontend.
      </p>

      <div class="diagram-box">
        <div class="diagram-flow">
          <span class="node">Frontend (Vanilla JS)</span>
          <span class="arrow">→</span>
          <span class="node highlight">Go Fiber API (GCP)</span>
          <span class="arrow">→</span>
          <span class="node">MongoDB Atlas / Cloud</span>
        </div>
        <p class="diagram-caption">Alur integrasi API antara antarmuka Vanilla JavaScript, layanan Go Fiber di GCP, dan MongoDB.</p>
      </div>

      <h2>2. Implementasi Endpoint &amp; Middleware CORS di Go Fiber</h2>
      <p>
        Bagian paling menarik saat menulis kode di <strong>Go Fiber</strong> adalah betapa bersihnya pengelolaan <em>routing</em> dan <em>middleware</em>. Namun, saat mencoba menghubungkan frontend berbasis <strong>Vanilla JavaScript</strong> menggunakan <code>fetch()</code>, saya sempat menemui error klasik: <em>CORS policy blocked</em>. Masalah ini selesai setelah saya menambahkan middleware CORS bawaan Fiber dan mengatur header izin akses origin dengan tepat.
      </p>

      <div class="code-block">
        <div class="code-header">
          <span>main.go (Service API Go Fiber + MongoDB)</span>
          <button type="button" class="btn-copy" onclick="copyCode(this)">Salin Kode</button>
        </div>
        <pre><code>package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Koneksi ke MongoDB menggunakan URI dari environment variable GCP
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		log.Fatal(err)
	}
	collection := client.Database("microservice_db").Collection("items")

	app := fiber.New()
	app.Use(cors.New()) // Mengizinkan akses API dari Vanilla JS

	app.Get("/api/v1/items", func(c *fiber.Ctx) error {
		cursor, err := collection.Find(context.Background(), bson.M{})
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal mengambil data"})
		}
		var results []bson.M
		if err = cursor.All(context.Background(), &results); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal parsing data"})
		}
		return c.JSON(fiber.Map{"status": "success", "data": results})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}</code></pre>
      </div>

      <h2>3. Integrasi API dengan Vanilla JavaScript &amp; Deploy ke GCP</h2>
      <p>
        Di sisi frontend, saya sengaja menggunakan <strong>Vanilla JavaScript</strong> murni tanpa framework agar benar-benar memahami cara kerja <code>async/await</code> dan <code>fetch()</code> saat berinteraksi dengan endpoint layanan yang sudah di-deploy ke <strong>Google Cloud Platform (GCP)</strong>.
      </p>

      <div class="code-block">
        <div class="code-header">
          <span>app.js (Konsumsi API Microservice di Vanilla JS)</span>
          <button type="button" class="btn-copy" onclick="copyCode(this)">Salin Kode</button>
        </div>
        <pre><code>const API_BASE_URL = "https://service-api-xyz.a.run.app/api/v1";

async function loadItems() {
  try {
    const response = await fetch(\`\${API_BASE_URL}/items\`);
    if (!response.ok) throw new Error("Gagal terhubung ke server GCP");

    const result = await response.json();
    console.log("Data dari Go Fiber & MongoDB:", result.data);
  } catch (error) {
    console.error("Terjadi kesalahan integrasi:", error.message);
  }
}

loadItems();</code></pre>
      </div>

      <blockquote>
        "Membangun microservices bukan sekadar memecah kode menjadi beberapa folder, melainkan memastikan setiap layanan memiliki kontrak API yang jelas, aman di cloud, dan mudah dikonsumsi oleh klien mana pun."
      </blockquote>

      <div class="takeaway-box">
        <h3>Pelajaran Utama (Key Takeaways)</h3>
        <ul>
          <li><strong>Go Fiber sangat efisien:</strong> Struktur handler-nya memudahkan pembuatan REST API yang ringan dan cepat di-compile menjadi binary tunggal untuk container GCP.</li>
          <li><strong>Environment Variable itu krusial:</strong> Menyimpan kredensial <code>MONGO_URI</code> dan konfigurasi <code>PORT</code> di environment GCP menjaga keamanan kode sumber.</li>
          <li><strong>Fundamental Vanilla JS:</strong> Mengintegrasikan API tanpa bantuan library eksternal melatih pemahaman mendalam soal siklus HTTP request, status code, dan penanganan error asinkron.</li>
        </ul>
      </div>
    `
  },
  {
    id: "belajar-vuejs-landing-page",
    category: "Frontend",
    date: "8 Oktober 2025",
    title: "Belajar Vue.js dari Nol: Membangun Landing Page Interaktif &amp; Responsif",
    subtitle:
      "Bagaimana konsep komponen, reaktivitas data, dan directive di Vue.js mengubah cara saya menyusun antarmuka web menjadi jauh lebih rapi dan terstruktur.",
    excerpt:
      "Pengalaman bertransisi dari manipulasi DOM manual ke pendekatan deklaratif menggunakan Vue.js untuk merancang sebuah landing page modern yang cepat dan mudah dirawat.",
    tags: ["Vue.js", "Frontend", "Landing Page", "UI/UX", "JavaScript"],
    initialClaps: 0,
    content: `
      <p>
        Setelah terbiasa menulis manipulasi DOM secara manual menggunakan JavaScript murni, saya mulai merasakan bahwa mengelola banyak elemen interaktif dalam satu halaman membutuhkan kode yang cukup panjang. Dari situlah saya mulai mempelajari <strong>Vue.js</strong> dengan target proyek pertama: membangun sebuah <strong>Landing Page</strong> yang bersih, responsif, dan interaktif.
      </p>

      <h2>1. Memahami Pola Pikir Deklaratif &amp; Komponen</h2>
      <p>
        Hal pertama yang membuat saya terkesan pada <strong>Vue.js</strong> adalah kurva belajarnya yang ramah. Alih-alih mencari elemen HTML dengan <code>document.querySelector()</code> lalu mengubah isinya satu per satu, Vue memungkinkan saya mendefinisikan <em>state</em> data terlebih dahulu, lalu tampilan akan otomatis menyesuaikan ketika data tersebut berubah.
      </p>

      <div class="diagram-box">
        <div class="diagram-flow">
          <span class="node">Navbar Component</span>
          <span class="arrow">+</span>
          <span class="node highlight">Hero &amp; Fitur (Reactive State)</span>
          <span class="arrow">+</span>
          <span class="node">CTA &amp; Footer</span>
        </div>
        <p class="diagram-caption">Pemecahan struktur Landing Page menjadi bagian-bagian komponen yang terorganisir di Vue.js.</p>
      </div>

      <h2>2. Menggunakan Directive v-for dan Reaktivitas untuk Seksi Fitur</h2>
      <p>
        Pada halaman <em>landing page</em>, biasanya terdapat bagian kartu keunggulan produk, daftar layanan, dan pertanyaan umum (FAQ). Dengan memanfaatkan directive <code>v-for</code> dan <code>v-if</code>, saya tidak perlu menulis ulang kode HTML yang berulang—cukup menyimpan daftar fitur dalam array reaktif dan merendernya secara otomatis.
      </p>

      <div class="code-block">
        <div class="code-header">
          <span>LandingPage.vue (Composition API)</span>
          <button type="button" class="btn-copy" onclick="copyCode(this)">Salin Kode</button>
        </div>
        <pre><code>&lt;script setup&gt;
import { ref } from 'vue'

const heroTitle = ref('Solusi Digital Modern untuk Produktivitas Tim')
const activeFaq = ref(null)

const features = ref([
  { id: 1, title: 'Performa Cepat', desc: 'Rendering ringan dengan Virtual DOM Vue.' },
  { id: 2, title: 'Desain Responsif', desc: 'Tampilan optimal di layar desktop maupun mobile.' },
  { id: 3, title: 'Mudah Dikembangkan', desc: 'Struktur komponen terpisah yang rapi dan reusable.' }
])

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}
&lt;/script&gt;

&lt;template&gt;
  &lt;section class="hero"&gt;
    &lt;h1&gt;{{ heroTitle }}&lt;/h1&gt;
    &lt;div class="feature-grid"&gt;
      &lt;div v-for="item in features" :key="item.id" class="feature-card"&gt;
        &lt;h3&gt;{{ item.title }}&lt;/h3&gt;
        &lt;p&gt;{{ item.desc }}&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/section&gt;
&lt;/template&gt;</code></pre>
      </div>

      <h2>3. Tantangan Styling &amp; Responsivitas</h2>
      <p>
        Dalam membangun <em>landing page</em>, tantangan terbesarnya bukan hanya membuat fitur berjalan, melainkan menjaga konsistensi jarak (<em>spacing</em>), hierarki tipografi, dan kenyamanan tampilan di layar ponsel. Fitur <code>&lt;style scoped&gt;</code> di Vue sangat membantu memastikan aturan CSS pada satu komponen tidak bocor dan merusak tampilan komponen lainnya.
      </p>

      <blockquote>
        "Vue.js menjembatani kesederhanaan HTML/CSS standar dengan kekuatan arsitektur komponen modern, sehingga proses merancang landing page terasa jauh lebih terstruktur."
      </blockquote>

      <div class="takeaway-box">
        <h3>Pelajaran Utama (Key Takeaways)</h3>
        <ul>
          <li><strong>Reaktivitas menghemat banyak kode:</strong> Perubahan state pada menu mobile atau accordion FAQ langsung memperbarui tampilan tanpa manipulasi DOM manual.</li>
          <li><strong>Data-driven UI:</strong> Menyimpan konten kartu fitur dalam array objek membuat halaman mudah diperbarui kapan saja.</li>
          <li><strong>Scoped CSS menjaga kerapian:</strong> Setiap bagian landing page memiliki gaya yang terisolasi dan minim konflik.</li>
        </ul>
      </div>
    `
  }
];

/* =========================================================
   STATE & SELEKTOR ELEMEN DOM
   ========================================================= */
let activeCategory = "Semua";
let currentPostId = null;

const clapsMap = JSON.parse(localStorage.getItem("devlog_2_claps") || "{}");

const homeView = document.getElementById("home-view");
const articleView = document.getElementById("article-view");
const postsGrid = document.getElementById("posts-grid");
const categoryFilters = document.getElementById("category-filters");
const aboutModal = document.getElementById("about-modal");

/* =========================================================
   RENDER DAFTAR BLOG DI BERANDA
   ========================================================= */
function renderPostsList() {
  const filtered =
    activeCategory === "Semua"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  postsGrid.innerHTML = filtered
    .map(
      (post) => `
      <article class="post-card" onclick="openArticle('${post.id}')">
        <div>
          <div class="card-top">
            <span class="card-cat">${post.category}</span>
          </div>
          <h2>${post.title}</h2>
          <p>${post.excerpt}</p>
        </div>
        <div>
          <div class="card-tags">
            ${post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
          </div>
          <div class="card-footer">
            <span>${post.date}</span>
            <span class="read-more">Baca Selengkapnya →</span>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

/* =========================================================
   BUKA HALAMAN DETAIL ARTIKEL
   ========================================================= */
function openArticle(id) {
  const post = blogPosts.find((p) => p.id === id);
  if (!post) return;

  currentPostId = id;
  document.getElementById("detail-category").textContent = post.category;
  document.getElementById("detail-meta").innerHTML = `
    <span>📅 ${post.date}</span>
  `;
  document.getElementById("detail-title").innerHTML = post.title;
  document.getElementById("detail-subtitle").textContent = post.subtitle;
  document.getElementById("detail-content").innerHTML = post.content;

  // Hitung jumlah apresiasi (clap)
  const savedClaps = clapsMap[id] ?? post.initialClaps;
  document.getElementById("clap-count").textContent = savedClaps;

  // Render artikel rekomendasi lainnya
  const related = blogPosts.filter((p) => p.id !== id);
  document.getElementById("related-grid").innerHTML = related
    .map(
      (item) => `
      <div class="related-card" onclick="openArticle('${item.id}')">
        <span>${item.category}</span>
        <h4>${item.title}</h4>
      </div>
    `
    )
    .join("");

  homeView.classList.add("hidden");
  articleView.classList.remove("hidden");
  document.getElementById("btn-all-posts").classList.remove("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  currentPostId = null;
  articleView.classList.add("hidden");
  homeView.classList.remove("hidden");
  document.getElementById("btn-all-posts").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   UTILITAS: SALIN KODE, APRESIASI, FILTER, & DARK MODE
   ========================================================= */
window.copyCode = function (btn) {
  const codeText = btn.closest(".code-block").querySelector("code").innerText;
  navigator.clipboard.writeText(codeText).then(() => {
    const original = btn.textContent;
    btn.textContent = "Tersalin!";
    setTimeout(() => {
      btn.textContent = original;
    }, 1500);
  });
};

document.getElementById("btn-clap").addEventListener("click", () => {
  if (!currentPostId) return;
  const post = blogPosts.find((p) => p.id === currentPostId);
  const current = clapsMap[currentPostId] ?? post.initialClaps;
  const updated = current + 1;
  clapsMap[currentPostId] = updated;
  localStorage.setItem("devlog_2_claps", JSON.stringify(clapsMap));
  document.getElementById("clap-count").textContent = updated;
});

categoryFilters.addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;
  document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  activeCategory = chip.dataset.category;
  renderPostsList();
});

// Navigasi & Modal
document.getElementById("nav-home").addEventListener("click", showHome);
document.getElementById("btn-all-posts").addEventListener("click", showHome);
document.getElementById("btn-back").addEventListener("click", showHome);

document.getElementById("btn-about").addEventListener("click", () => {
  aboutModal.classList.remove("hidden");
});
document.getElementById("close-modal").addEventListener("click", () => {
  aboutModal.classList.add("hidden");
});
aboutModal.addEventListener("click", (e) => {
  if (e.target === aboutModal) aboutModal.classList.add("hidden");
});

// Toggle Tema Terang / Gelap
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("devlog_theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const nextTheme = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("devlog_theme", nextTheme);
  themeToggle.textContent = nextTheme === "dark" ? "☀️" : "🌙";
});

// Inisialisasi Awal
renderPostsList();