package handlers

import (
    "encoding/json"
    "html/template"
    "net/http"
    "fraudbase/internal/models"
)

type DashboardHandler struct {
    tmpl *template.Template
}

func NewDashboardHandler() *DashboardHandler {
    tmpl := template.Must(template.ParseFiles("web/templates/dashboard.html"))
    return &DashboardHandler{tmpl: tmpl}
}

func (h *DashboardHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
    h.tmpl.ExecuteTemplate(w, "dashboard.html", nil)
}

func (h *DashboardHandler) CreateFraud(w http.ResponseWriter, r *http.Request) {
    var fraud models.Fraud
    if err := json.NewDecoder(r.Body).Decode(&fraud); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Aqui implementaremos a inserção no banco de dados
    w.WriteHeader(http.StatusCreated)
}
