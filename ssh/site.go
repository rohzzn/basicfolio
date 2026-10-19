package main

import (
	_ "embed"
	"encoding/json"
)

// data/site.json is written by gen-data.mjs from the site's own data files and built into the binary.
//
//go:embed data/site.json
var siteJSON []byte

type Site struct {
	ProjectGroups  []ProjectGroup `json:"projectGroups"`
	LatestProjects []string       `json:"latestProjects"`
	Writing        []Post         `json:"writing"`
	Books          []Book         `json:"books"`
	LinkGroups     []LinkGroup    `json:"linkGroups"`
}

type ProjectGroup struct {
	Label    string    `json:"label"`
	Projects []Project `json:"projects"`
}

type Project struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Year        int      `json:"year"`
	Tech        []string `json:"tech"`
	Links       []struct {
		Label string `json:"label"`
		URL   string `json:"url"`
	} `json:"links"`
	Install string `json:"install"`
	Story   string `json:"story"`
	Group   string `json:"-"`
}

type Post struct {
	Slug        string  `json:"slug"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	Category    string  `json:"category"`
	Words       int     `json:"words"`
	Body        []Block `json:"body"`
}

// Block is one piece of a post: h a heading, p a paragraph, li a list item, pre code, embed
// something only the website can show.
type Block struct {
	T    string `json:"t"`
	Text string `json:"text"`
}

type Book struct {
	Title  string `json:"title"`
	Review string `json:"review"`
	Score  int    `json:"score"`
}

type LinkGroup struct {
	Label string `json:"label"`
	Links []struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		URL         string `json:"url"`
	} `json:"links"`
}

var site Site

// projectList is every project in the order the Projects tab lists them, each carrying its group.
var projectList []Project

func projectBySlug(slug string) (Project, bool) {
	for _, p := range projectList {
		if p.Slug == slug {
			return p, true
		}
	}
	return Project{}, false
}

func loadSite() error {
	if err := json.Unmarshal(siteJSON, &site); err != nil {
		return err
	}
	for _, g := range site.ProjectGroups {
		for _, p := range g.Projects {
			p.Group = g.Label
			projectList = append(projectList, p)
		}
	}
	return nil
}
