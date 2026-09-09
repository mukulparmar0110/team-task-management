FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["TeamTaskManagement.API/TeamTaskManagement.API.csproj", "TeamTaskManagement.API/"]

RUN dotnet restore "TeamTaskManagement.API/TeamTaskManagement.API.csproj"

COPY . .

WORKDIR "/src/TeamTaskManagement.API"

RUN dotnet publish "TeamTaskManagement.API.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TeamTaskManagement.API.dll"]