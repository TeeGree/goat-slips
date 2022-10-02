using GoatSlipsApi.DAL;
using GoatSlipsApi.Helpers;
using GoatSlipsApi.Models;
using GoatSlipsApi.Services;
using System.Diagnostics;
using Microsoft.OpenApi.Models;

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
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITimeSlipService, TimeSlipService>();
builder.Services.AddSingleton<IJwtUtils, JwtUtils>();
builder.Services.AddSingleton<ISecretService, SecretService>();

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
            .WithOrigins("http://localhost:3000")
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
    app.UseSwaggerUI();
}

app.UseMiddleware<JwtMiddleware>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors("corsapp");

app.MapControllers();

app.Run();
