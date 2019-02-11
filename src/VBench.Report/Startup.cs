using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System.IO;

namespace VBench.Report
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseBrowserLink();
                app.UseDeveloperExceptionPage();
            }

            UseNodeModules(app, env);
            app.UseFileServer();
        }

        private static IApplicationBuilder UseFolder(IApplicationBuilder app, string rootDirectory, string name)
        {
            var path = Path.Combine(rootDirectory, name);

            if (Directory.Exists(path))
            {
                app.UseStaticFiles(new StaticFileOptions()
                {
                    RequestPath = $"/{name}",
                    FileProvider = new PhysicalFileProvider(path)
                });
            }

            return app;
        }

        private static IApplicationBuilder UseNodeModules(IApplicationBuilder app, IHostingEnvironment host) => UseFolder(app, host.ContentRootPath, "node_modules");
    }
}