using GoatSlips.DAL;
using GoatSlips.Helpers;
using GoatSlips.Models;
using GoatSlips.Services;
using System.Diagnostics;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;

var builder = WebApplication.CreateBuilder(args);

string appsettingsFileName = Debugger.IsAttached ? "appsettings.Development.json" : "appsettings.json";

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile(appsettingsFileName);

IConfigurationRoot config = configuration.Build();
string connectionString = config.GetConnectionString("ConnectionString");

// Add services to the container.
builder.Services.AddSingleton<IAppSettings>(new AppSettings(connectionString, config["Secret"]));
builder.Services.AddScoped<IGoatSlipsContext, GoatSlipsContext>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ILaborCodeRepository, LaborCodeRepository>();
builder.Services.AddScoped<ITimeSlipRepository, TimeSlipRepository>();
builder.Services.AddScoped<IProjectTaskRepository, ProjectTaskRepository>();
builder.Services.AddScoped<IAccessRightRepository, AccessRightRepository>();
builder.Services.AddScoped<IUserAccessRightRepository, UserAccessRightRepository>();
builder.Services.AddScoped<IFavoriteTimeSlipRepository, FavoriteTimeSlipRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITimeSlipService, TimeSlipService>();
builder.Services.AddScoped<IFavoriteTimeSlipService, FavoriteTimeSlipService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectTaskService, ProjectTaskService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ILaborCodeService, LaborCodeService>();
builder.Services.AddSingleton<IJwtUtils, JwtUtils>();
builder.Services.AddSingleton<ISecretService, SecretService>();

// In production, the React files will be served from this directory
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "Client/build";
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TestWebApi", Version = "v1" });

    c.AddSecurityDefinition(JwtAuthenticationDefaults.AuthenticationScheme,
    new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = JwtAuthenticationDefaults.HeaderName, // Authorization
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = JwtAuthenticationDefaults.AuthenticationScheme
                }
            },
            new List<string>()
        }
    });
});

builder.Services.AddCors(p => {
    p.AddPolicy("corsapp", builder =>
    {
        builder
            .WithOrigins()
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("v1/swagger.json", "Goat Slips API");
    });
}

app.UseMiddleware<JwtMiddleware>();

app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseHttpsRedirection();

app.UseCors("corsapp");

app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/{id?}");
});

app.UseSpa(spa =>
{
    spa.Options.SourcePath = "Client";

    if (Debugger.IsAttached)
    {
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
});

app.Run();
