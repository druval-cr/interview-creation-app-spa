if Rails.env == 'production'
	Rails.application.config.session_store :cookie_store, key: "_interview_creation_app_spa", domain:  "your-production-app-here.com"
else
	Rails.application.config.session_store :cookie_store, key: "_interview_creation_app_spa"
end