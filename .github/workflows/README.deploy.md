# README - Despliegue de Climatica mediante GitHub Actions

## Resumen

La aplicación **Climatica** se despliega mediante un **GitHub Actions Self-Hosted Runner** instalado en el servidor de producción.

La aplicación está alojada en:

```text
/home/guiveg/climatica-nextjs
```

y se ejecuta mediante el servicio systemd:

```text
climatica.service
```

El runner permite lanzar despliegues manuales desde GitHub sin necesidad de acceder por SSH al servidor.

---

## Arquitectura

```text
GitHub
   |
   v
GitHub Actions
   |
   v
Self-Hosted Runner (github-runner)
   |
   +--> git pull origin main
   +--> npm run build
   +--> systemctl restart climatica
   |
   v
Aplicación Climatica
```

---

## Usuarios

### Usuario de la aplicación

```text
guiveg
```

Propietario del código fuente y del servicio de la aplicación.

Repositorio local:

```text
/home/guiveg/climatica-nextjs
```

### Usuario del runner

```text
github-runner
```

Usuario dedicado para ejecutar GitHub Actions.

Comprobar:

```bash
ps -ef | grep Runner.Listener
```

Debe aparecer:

```text
github-runner
```

---

## Grupo compartido

Se utiliza el grupo:

```text
deploy
```

para compartir acceso al repositorio entre:

```text
guiveg
github-runner
```

---

## Servicio del runner

Servicio systemd:

```text
actions.runner.ClimaticaHQ-climatica-nextjs.climate.service
```

Comprobar estado:

```bash
sudo systemctl status actions.runner.ClimaticaHQ-climatica-nextjs.climate
```

Ver configuración:

```bash
sudo systemctl cat actions.runner.ClimaticaHQ-climatica-nextjs.climate
```

La línea importante es:

```ini
User=github-runner
```

---

## Servicio de la aplicación

Servicio:

```text
climatica.service
```

Comandos útiles:

```bash
sudo systemctl status climatica
sudo systemctl restart climatica
```

Ver logs:

```bash
journalctl -fu climatica
```

---

## Permisos sudo

Entradas esperadas en sudoers:

```text
github-runner ALL=(ALL) NOPASSWD:/usr/bin/systemctl restart climatica
github-runner ALL=(ALL) NOPASSWD:/usr/bin/systemctl is-active climatica
```

---

## Configuración Git

Repositorio marcado como seguro:

```bash
sudo -u github-runner git config --global --add safe.directory /home/guiveg/climatica-nextjs
```

Configuración recomendada:

```bash
git -C /home/guiveg/climatica-nextjs config core.sharedRepository group
```

---

## Workflow GitHub Actions

Fichero:

```text
.github/workflows/deploy.yml
```

Disparador actual:

```yaml
on:
  workflow_dispatch:
```

---

## Procedimiento de despliegue

1. Acceder al repositorio en GitHub.
2. Ir a:

```text
Actions
→ Deploy Climatica
→ Run workflow
```

3. Ejecutar el workflow.

El workflow realiza:

```text
git pull origin main
npm run build
systemctl restart climatica
systemctl is-active climatica
```

---

## Monitorización

### Logs del runner

```bash
sudo journalctl -fu actions.runner.ClimaticaHQ-climatica-nextjs.climate
```

### Logs de la aplicación

```bash
journalctl -fu climatica
```

---

## Última validación

Despliegue correcto mediante GitHub Actions el 16/09/2026 usando:

```text
Runner: github-runner
Workflow: Deploy Climatica
Servicio: climatica.service
```
