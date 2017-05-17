# Estándares
1. <a href="#1">Introducción</a>
1. <a href="#2">Documentación del código</a>
   1. <a href="#21">Estándar</a>
   1. <a href="#22">Verificación</a>
1. <a href="#3">Documentación de la API web</a>
   1. <a href="#31">Estándar</a>
   1. <a href="#32">Verificación</a>
1. <a href="#4">Codificación</a>
   1. <a href="#41">Estándar</a>
   1. <a href="#42">Verificación</a>

# 1. Introducción
<a name="1" />

En este documento se definen los estándares usados en la aplicación ***Añisclo's POI*** para la asignatura de Laboratorio de Ingeniería del Software. El documento se divide en tres partes definiendo unos estándares determinados para cada una de ellas: Documentación del código, API y Codificación.

# 2. Documentación del código
<a name="2" />

# 2.1 Estándar
<a name="21" />

Todos los ficheros de código del proyecto de ***Añisclo's POI*** sean del lenguaje que sean deben seguir los siguientes requisitos:
- Toda función o método debe tener una breve explicación de la descripción de su funcionamiento. Los métodos de acceso a atributos tipo “getAtributo” o “setAtributo” pueden prescindir de ella si poseen in nombre intuitivo.
- Debe estar escrito en inglés.

# 2.2 Verificación
<a name="22" />

Para cada uno de los lenguajes se han de seguir los siguientes pasos para verificar que cumple con los estándares del código:

1. Se colocan todos los ficheros en una misma carpeta
2. Se le da un papel a cada uno de los cuatro integrantes del grupo. En él, deben escribir un número sin que nadie más lo vea del 1 al 10.
3. Se muestran los resultados, se suman y se escoge el número del fichero que haya salido. En caso de haber menos ficheros que el número resultante, se vuelve a iterar desde el primero con la operación módulo.
4. Se comprueban los requisitos de estándar para todo el fichero.
5. Si cumple el estándar se acaba la verificación, si no, se realiza el paso anterior para todos los ficheros asumiendo que puede haber fallo en más de uno.

# 3. Documentación de la API web
<a name="3" />

# 3.1 Estándar
<a name="31" />

Todas las peticiones que vaya a recibir el servidor de ***Smart CampUZ*** tienen que estar recogidas en el documento de la API web definida por Swagger y cumplir los siguientes requisitos:
- Tiene que tener el tipo de petición http definida (PUT, POST, GET, etc.).
- Tiene que tener un nombre de end-point.
- Tiene que tener los parámetros de la petición si los hubiera, en formato JSON.
- Tiene que tener definidos mínimo un estado de respuesta válida con el código http 200 y uno de respuesta fallida con el código http 404.
- Tanto el mensaje de respuesta de éxito como el de fallo, tienen que tener definidos la respuesta que se va a intercambiar (en caso de ser un objeto, en formato JSON).

# 3.2 Verificación
<a name="32" />

Para comprobar que todas las peticiones siguen los estándares citados anteriormente se han de seguir los siguientes pasos:

1. Se colocan todos los ficheros de Web Services que contienen los end-points de la aplicación en una misma carpeta.
2. Se le da un papel a cada uno de los cuatro integrantes del grupo. En él, deben escribir un número sin que nadie más lo vea del 1 al 10.
3. Se muestran los resultados, se suman y se escoge el número del fichero que haya salido. En caso de haber menos ficheros que el número resultante, se vuelve a iterar desde el primero con la operación módulo.
4. Se comprueba que todas las peticiones de ese fichero están recogidas en el documento de la API web de Swagger UI y que cumple los requisitos citados anteriormente.
5. Si cumple el estándar se acaba la verificación, si no, se realiza el paso anterior para todos los ficheros asumiendo que puede haber fallo en más de uno.

# 4. Codificación
<a name="4" />

# 4.1 Estándar
<a name="41" />

***Añisclo's POI*** utiliza diferentes lenguajes. Cada uno de ellos tienen que seguir las guías de estilo citadas a continuación: 
- **HTML:** [W3Schools](http://www.w3schools.com/html/html5_syntax.asp) (Modificación de que el límite de caracteres por línea son 100)
- **CSS:** [Google styleguide](https://google.github.io/styleguide/htmlcssguide.xml)
- **JavaScript:** [W3Schools](http://www.w3schools.com/js/js_conventions.asp)

# 4.2 Verificación
<a name="42" />

Para cada uno de los lenguajes se han de seguir los siguientes pasos para verificar que cumple con los estándares del código:

1. Se colocan todos los ficheros en una misma carpeta
2. Se le da un papel a cada uno de los cuatro integrantes del grupo. En él, deben escribir un número sin que nadie más lo vea del 1 al 10.
3. Se muestran los resultados, se suman y se escoge el número del fichero que haya salido. En caso de haber menos ficheros que el número resultante, se vuelve a iterar desde el primero con la operación módulo.
4. Se comprueban los requisitos de estándar para todo el fichero.
5. Si cumple el estándar se acaba la verificación, si no, se realiza el paso anterior para todos los ficheros asumiendo que puede haber fallo en más de uno.
