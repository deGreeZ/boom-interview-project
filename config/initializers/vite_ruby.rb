# Patch ViteRuby to use absolute URLs in development
if Rails.env.development?
  # Patch the ViteRuby helpers to use absolute URLs
  Rails.application.config.to_prepare do
    module ViteRubyUrlPatch
      def vite_client_tag(**options)
        return "" unless ViteRuby.instance.dev_server_running?

        # Generate both the preamble and client tags
        tags = []

        # Add the React refresh preamble if present
        if defined?(vite_manifest.react_refresh_preamble) && (preamble = vite_manifest.react_refresh_preamble)
          # The preamble already contains script tags, just output it directly
          tags << preamble
        end

        # Add the Vite client script - this is always at a standard path in dev mode
        client_url = "http://localhost:3036/vite/@vite/client"
        tags << '<script src="%s" crossorigin="anonymous" type="module"></script>' % client_url

        tags.join("\n").html_safe
      end

      def vite_javascript_tag(*names, **options)
        entries = vite_manifest.resolve_entries(*names, type: :javascript)

        entries.fetch(:scripts).map do |src|
          # Force absolute URL in development
          if ViteRuby.instance.dev_server_running?
            # In dev mode, Vite serves TypeScript files directly as .tsx
            # Convert .js extension to .tsx for entrypoints
            src = src.gsub(/\/entrypoints\/(.+)\.js$/, '/entrypoints/\1.tsx')
            src = "http://localhost:3036#{src}" unless src.start_with?("http")
          end

          '<script src="%s" crossorigin="anonymous" type="module"></script>'.html_safe % src
        end.join("\n").html_safe
      end
    end

    # Apply patch to the helpers
    ActionView::Base.include(ViteRubyUrlPatch)
  end
end
