/**
 * import-verses.js
 * ────────────────────────────────────────────────────────────
 * Importe les versets d'un livre biblique (Segond 1910) dans la
 * table `verses` de Supabase.
 *
 * Source du texte : API getbible.net (Louis Segond 1910, domaine public).
 * Par défaut : la Genèse (numéro 1). Modifiable via la config en bas.
 *
 * Le script :
 *   1. télécharge le JSON du livre depuis getbible,
 *   2. récupère l'id (uuid) du livre dans Supabase via son slug,
 *   3. insère les versets par lots, en évitant les doublons,
 *   4. vérifie le nombre de versets importés.
 *
 * ⚠️ Utilise la clé SERVICE_ROLE (écriture, contourne la RLS).
 *    Ne jamais committer le fichier .env ni exposer cette clé.
 * ────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// ── Configuration ───────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Le livre à importer : slug dans TA base + numéro getbible + code traduction.
// getbible : Genèse = 1, Exode = 2, … (ordre canonique classique).
const BOOK = {
  slug: "genesis",        // doit correspondre au slug dans ta table `books`
  getbibleNumber: 1,      // numéro du livre dans l'API getbible
  translation: "LSG1910", // valeur stockée dans la colonne `translation`
};

const GETBIBLE_URL = `https://api.getbible.net/v2/ls1910/${BOOK.getbibleNumber}.json`;
const BATCH_SIZE = 500;   // insertion par lots pour ne pas surcharger

// ── Garde-fous ──────────────────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant. Vérifie ton fichier .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── 1. Récupérer l'id du livre dans Supabase ────────────────
async function getBookId(slug) {
  const { data, error } = await supabase
    .from("books")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error(`Livre "${slug}" introuvable dans la base. As-tu lancé le seed des livres ? (${error?.message})`);
  }
  console.log(`📖 Livre trouvé : ${data.name} (id ${data.id})`);
  return data.id;
}

// ── 2. Télécharger le texte depuis getbible ─────────────────
async function fetchVerses() {
  console.log(`🌐 Téléchargement depuis ${GETBIBLE_URL} …`);
  const res = await fetch(GETBIBLE_URL);
  if (!res.ok) throw new Error(`Échec du téléchargement : HTTP ${res.status}`);
  const json = await res.json();

  // Structure getbible v2 : { book: [ { chapter, verses: [ { chapter, verse, text }, … ] }, … ] }
  // On aplatit en une liste de versets.
  const rows = [];
  const chapters = json.book || json.chapters || [];
  for (const ch of chapters) {
    const chapterNum = ch.chapter;
    for (const v of ch.verses) {
      rows.push({
        chapter: Number(chapterNum ?? v.chapter),
        verse_number: Number(v.verse),
        text: (v.text || "").trim(),
      });
    }
  }
  if (rows.length === 0) {
    throw new Error("Aucun verset extrait — la structure du JSON a peut-être changé. Inspecte la réponse de l'API.");
  }
  console.log(`✅ ${rows.length} versets extraits de la source.`);
  return rows;
}

// ── 3. Insérer dans Supabase par lots ───────────────────────
async function insertVerses(bookId, rows) {
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map((r) => ({
      book_id: bookId,
      chapter: r.chapter,
      verse_number: r.verse_number,
      text: r.text,
      translation: BOOK.translation,
    }));

    // upsert : si le verset existe déjà (même book/chapter/verse/translation), il est ignoré/mis à jour.
    const { error } = await supabase
      .from("verses")
      .upsert(batch, { onConflict: "book_id,chapter,verse_number,translation" });

    if (error) throw new Error(`Erreur d'insertion (lot ${i / BATCH_SIZE + 1}) : ${error.message}`);
    inserted += batch.length;
    console.log(`   … ${inserted}/${rows.length} versets insérés`);
  }
  return inserted;
}

// ── 4. Vérification post-import ─────────────────────────────
async function verify(bookId) {
  const { count, error } = await supabase
    .from("verses")
    .select("*", { count: "exact", head: true })
    .eq("book_id", bookId)
    .eq("translation", BOOK.translation);

  if (error) throw new Error(`Vérification impossible : ${error.message}`);
  console.log(`🔎 Total en base pour ce livre : ${count} versets.`);
}

// ── Orchestration ───────────────────────────────────────────
(async () => {
  try {
    console.log(`\n🚀 Import des versets — ${BOOK.slug} (${BOOK.translation})\n`);
    const bookId = await getBookId(BOOK.slug);
    const rows = await fetchVerses();
    const n = await insertVerses(bookId, rows);
    await verify(bookId);
    console.log(`\n🎉 Terminé : ${n} versets traités pour ${BOOK.slug}.\n`);
  } catch (err) {
    console.error(`\n❌ ${err.message}\n`);
    process.exit(1);
  }
})();
