package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

// Data models
type LevelSave struct {
	ID    int    `json:"id"`
	Level string `json:"level"`
	Wands string `json:"wands"`
}

// Initialize SQLite database
func initDB() *sql.DB {
	db, err := sql.Open("sqlite3", "./game.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create table
	stmt := `
	CREATE TABLE IF NOT EXISTS saves (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		level TEXT,
		wands TEXT
	);
	`
	_, err = db.Exec(stmt)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

// Handler functions
func saveLevel(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var levelSave LevelSave
		json.NewDecoder(r.Body).Decode(&levelSave)

		stmt, err := db.Prepare("INSERT INTO saves (level, wands) VALUES (?, ?)")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = stmt.Exec(levelSave.Level, levelSave.Wands)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func getLevel(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, level, wands FROM saves")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var levelSaves []LevelSave
		for rows.Next() {
			var levelSave LevelSave
			rows.Scan(&levelSave.ID, &levelSave.Level, &levelSave.Wands)
			levelSaves = append(levelSaves, levelSave)
		}
		json.NewEncoder(w).Encode(levelSaves)
	}
}

func main() {
	db := initDB()
	defer db.Close()
	http.Handle("/", http.FileServer(http.Dir("./public"))) // Serve client files
	http.HandleFunc("POST /save", saveLevel(db))
	http.HandleFunc("GET /load", getLevel(db))
	log.Println("Server started on :8080")
	err := http.ListenAndServe(":8080", nil) // Start listening on port 8080
	if err != nil {
		log.Fatal("ListenAndServe: ", err) // Log any errors starting the server
	}
}
