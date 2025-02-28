package middleware

import (
	"context"
	"log"
	"net/http"

	"fraudbase/internal/auth"
)

// Chave do contexto para armazenar informações do usuário
type contextKey string
const UserContextKey contextKey = "user"

// JWTAuthMiddleware protege as rotas verificando a presença de um token JWT válido
func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("=== JWT Authentication Middleware ===")
		
		// Extrair token do cabeçalho Authorization
		tokenString, err := auth.ExtractTokenFromRequest(r)
		if err != nil {
			log.Printf("Authorization error: %v", err)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Validar o token
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			log.Printf("Token validation error: %v", err)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		log.Printf("Authenticated request from user: %s", claims.Username)
		
		// Token válido, adicionar claims ao contexto da requisição
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AdminOnly é um middleware adicional para verificar se o usuário é admin
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(UserContextKey).(*auth.Claims)
		if !ok || !claims.IsAdmin {
			log.Println("Access denied: admin privileges required")
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}
