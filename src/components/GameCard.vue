<!-- src/components/GameCard.vue -->
<template>
  <div class="game-card card bg-base-200 shadow-xl overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
    <figure class="relative h-36 sm:h-40 md:h-48 overflow-hidden">
      <img 
        :src="getGameImage(game)" 
        :alt="game.title" 
        class="w-full h-full object-cover"
      />
      <!-- 100% Badge --->
      <div v-if="achievementPercent === 100" class="absolute top-0 left-0 m-1 sm:m-2">
        <div class="badge bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-bold text-xs sm:text-sm p-2 sm:p-3 shadow-lg border-2 border-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          100%
        </div>
      </div>
    </figure>
    <div class="card-body p-2 sm:p-3 md:p-4">
      <h2 class="card-title text-sm sm:text-base md:text-lg font-bold mb-1 line-clamp-1">{{ game.title }}</h2>
      <!-- Status badge -->
      <div v-if="gameStatus" class="mb-2">
        <span class="badge text-[10px] sm:text-xs p-1.5 sm:p-2 font-semibold" :class="statusBadgeClass">
          {{ statusBadgeText }}
        </span>
      </div>
      
      <div class="flex items-center text-xs sm:text-sm mb-2">
        <span class="badge badge-outline p-1 sm:p-2 h-auto">
          <!--NINTENDO SWITCH-->
          <svg v-if="game.platform=='Nintendo Switch'" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="nintendo-switch">
            <path fill="#F31014" d="M3.78 7.343c.022.391.043.498.203.815.236.482.585.835 1.067 1.072.333.166.418.182.851.198.391.016.53 0 .793-.092 1.076-.364 1.73-1.409 1.543-2.486-.209-1.27-1.425-2.127-2.673-1.875-.311.059-.787.299-1.044.52-.52.45-.782 1.092-.74 1.848z"></path>
            <path fill="#F31014" d="M5.136.078C2.746.506.824 2.274.219 4.599 0 5.44-.016 5.933.01 12.447c.01 5.978.016 6.118.118 6.584.552 2.491 2.32 4.264 4.837 4.848.327.075.745.091 3.434.102 2.78.022 3.069.016 3.145-.059.075-.075.08-1.034.08-11.904 0-8.063-.016-11.855-.048-11.924-.048-.092-.134-.096-3.048-.092-2.368.006-3.079.022-3.39.075l-.002.001zm4.482 1.855v10.072l.011-.001V22.07l-2.025-.026c-1.864-.022-2.062-.032-2.437-.124-1.602-.412-2.786-1.645-3.123-3.251-.107-.504-.107-12.863-.005-13.356A4.27 4.27 0 0 1 4.61 2.238c.654-.263.959-.295 3.085-.299l1.923-.006zM14.038.03c-.022.016-.032 5.4-.032 11.974 0 10.838.006 11.936.08 11.968.134.048 3.99.032 4.467-.022a6.204 6.204 0 0 0 4.767-3.279 8.19 8.19 0 0 0 .375-.867c.311-.933.305-.686.305-7.827 0-5.701-.01-6.552-.08-6.911-.493-2.588-2.469-4.543-5.062-4.987-.349-.059-.883-.076-2.614-.076-1.2-.006-2.191.01-2.207.026h.001zm2.404 12.435c.369-1.216 1.66-1.934 2.904-1.607v-.001a2.432 2.432 0 0 1 1.671 1.549c.166.466.161 1.152-.006 1.581-.305.787-.9 1.339-1.666 1.543-1.243.321-2.565-.429-2.924-1.661-.108-.375-.102-1.013.021-1.404z"></path>
          </svg>

          <!--PC-->
          <svg v-if="game.platform=='PC'"xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
          </svg>

          <!--PLAYSTATION -->

          <svg v-if="game.platform=='PlayStation 4' || game.platform=='PlayStation 5'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" id="playstation" viewBox="0 0 512 512">
            <path d="M399.8 203c-.8-17.1-3.3-34.5-10.8-50.1-4.1-8.6-9.7-16.5-16.5-23.2-6.3-6.4-13.6-11.7-21.3-16.3-17.1-10.2-37.5-17-84.4-31S192 64 192 64v358.3l79.9 25.7s.1-198.8.1-299.5v-3.8c0-9.3 7.5-16.8 16.1-16.8h.5c8.5 0 15.5 7.5 15.5 16.8V278c11 5.3 29.2 9.3 41.8 9.1 8.3.2 16.7-1.7 24-5.7 7.6-4.1 13.9-10.4 18.4-17.8 5.1-8.3 8.2-17.8 9.9-27.3 1.9-10.8 2-22.1 1.6-33.3zM86.7 357.8c27.4-9.8 89.3-29.5 89.3-29.5v-47.2s-76.5 24.8-111.3 37.1c-8.6 3.1-17.3 5.9-25.7 9.5-9.8 4.1-19.4 8.7-28.1 14.8-3.8 2.6-7.2 5.9-9.2 10.1-2 4.2-2.2 9.2-.5 13.6 2 5.1 5.8 9.3 10.1 12.6 7.8 5.9 17.1 9.5 26.4 12.2 28.4 9.4 58.4 14 88.4 13.3 14.5-.2 36-1.9 50-4.4v-42s-11 2.5-41.3 12.5c-4.6 1.5-9.2 3.3-14 4.3-7.1 1.6-14.4 2.1-21.6 2.2-6.5-.3-13.2-.7-19.3-3.1-2.2-1-4.6-2.2-5.5-4.6-.8-2 .3-4 1.7-5.4 2.8-2.9 6.8-4.5 10.6-6z" style="fill:#010101"></path>
            <path d="M512 345.9c-.1-6-3.7-11.2-7.9-15-7.1-6.3-15.9-10.3-24.7-13.5-5.5-1.9-9.3-3.3-14.7-5-25.2-8.2-51.9-11.2-78.3-11.3-8 .3-23.1.5-31 1.4-21.9 2.5-67.3 15.4-67.3 15.4v48.8s67.5-21.6 96.5-31.8c9.7-3.3 20.1-4.6 30.3-4.6 6.5.2 13.2.7 19.4 3.1 2.2.9 4.5 2.2 5.5 4.5.9 2.6-.9 5-2.9 6.5-4.7 3.8-10.7 5.3-16.2 7.4-41 14.5-132.7 44.7-132.7 44.7v47s117.2-39.6 170.8-58.8c8.9-3.3 17.9-6.1 26.4-10.4 7.9-4 15.8-8.6 21.8-15.3 3.1-3.6 5-8 5-13.1z" style="fill:#010101"></path>
          </svg>
          
          <!--XBOX-->

          <svg v-if="game.platform == 'Xbox Series X/S' || game.platform=='Xbox One'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="8 10 30 30" fill="none" id="xbox">
            <path fill="#23B900" fill-rule="evenodd" d="M19.118 12.94c1.172.318 2.743.94 3.49 1.382.927.549 1.33.798 1.718.779.327-.017.645-.222 1.256-.598 1.525-.94 5.334-2.094 6.208-1.881.393.095-.26-.306-1.451-.893-3.06-1.506-7.165-1.752-10.635-.636-1.325.426-2.479.886-2.563 1.023-.084.136.806.507 1.977.824ZM35.81 32.365c-.038-2.775-2.209-6.966-6.14-11.855l-1.9-2.363 1.704-1.563c.937-.86 2.268-1.866 2.959-2.236l1.255-.672 1.39 1.355c.765.745 1.881 2.35 2.481 3.565.94 1.905 1.107 2.645 1.208 5.351.136 3.63-.417 5.973-1.948 8.26l-.99 1.48-.019-1.322ZM10.276 20.142c-1.347 3.546-.621 9.009 1.638 12.326.89 1.308 1.093 1.442.804.532-.572-1.803 2.385-7.738 6.225-12.493l1.91-2.367-1.784-1.598c-.981-.879-2.302-1.877-2.934-2.218-1.065-.573-1.213-.578-1.987-.071-1.071.702-3.037 3.693-3.872 5.889Zm3.278 13.79c0 1.339 3.863 3.82 7.327 4.705 3.69.943 8.866-.064 12.03-2.342 2.625-1.89 2.713-2.555.735-5.542-1.22-1.84-6.669-7.485-8.372-8.671l-1.084-.755-2.418 2.085c-4.297 3.708-8.218 8.727-8.218 10.52Z" clip-rule="evenodd"></path>
          </svg>

          <!--iOS ( iPhone )-->

          <svg v-if=" game.platform=='iOS'" xmlns="http://www.w3.org/2000/svg" width="2038" height="2500" class="w-6 h-6" viewBox="0 0 496.255 608.728" id="apple">
            <path fill="#999" d="M273.81 52.973C313.806.257 369.41 0 369.41 0s8.271 49.562-31.463 97.306c-42.426 50.98-90.649 42.638-90.649 42.638s-9.055-40.094 26.512-86.971zM252.385 174.662c20.576 0 58.764-28.284 108.471-28.284 85.562 0 119.222 60.883 119.222 60.883s-65.833 33.659-65.833 115.331c0 92.133 82.01 123.885 82.01 123.885s-57.328 161.357-134.762 161.357c-35.565 0-63.215-23.967-100.688-23.967-38.188 0-76.084 24.861-100.766 24.861C89.33 608.73 0 455.666 0 332.628c0-121.052 75.612-184.554 146.533-184.554 46.105 0 81.883 26.588 105.852 26.588z"></path>
          </svg>

          <!--Android-->

          <svg xmlns="http://www.w3.org/2000/svg" v-if="game.platform=='Android'" class="w-6 h-6" viewBox="0 0 33.867 33.867" id="android">
            <path fill="#0ecf75" d="M11.31 21.564h2.118c.732 0 1.323.59 1.323 1.322v8.6a1.32 1.32 0 0 1-1.323 1.322H11.31a1.32 1.32 0 0 1-1.323-1.323v-8.599c0-.732.59-1.322 1.323-1.322zm9.13 0h2.116c.733 0 1.323.59 1.323 1.322v8.6a1.32 1.32 0 0 1-1.323 1.322h-2.117a1.32 1.32 0 0 1-1.323-1.323v-8.599c0-.732.59-1.322 1.323-1.322z" paint-order="fill markers stroke"></path>
            <path fill="#59d96b" d="M9.095 13.978a1.32 1.32 0 0 0-1.323 1.323v10.496c0 1.026.826 1.852 1.852 1.852h14.618a1.848 1.848 0 0 0 1.853-1.852V15.3a1.32 1.32 0 0 0-1.323-1.323zM10.156 1.06a.638.638 0 0 0-.28.085c-.319.185-.407.58-.243.91l1.251 2.533c-1.909 1.677-3.112 2.78-3.112 5.532v.496c0 .733.59 1.323 1.323 1.323H24.77a1.32 1.32 0 0 0 1.323-1.323v-.496c0-2.752-1.203-3.855-3.112-5.532l1.251-2.532c.164-.331.076-.726-.244-.91a.637.637 0 0 0-.374-.086.724.724 0 0 0-.536.329L21.61 3.591a9.141 9.141 0 0 0-4.677-1.276c-1.711 0-3.31.466-4.677 1.276L10.787 1.39a.726.726 0 0 0-.63-.33ZM3.44 13.893a2.376 2.376 0 0 1 2.38 2.38v6.483a2.376 2.376 0 0 1-2.38 2.381 2.376 2.376 0 0 1-2.382-2.38v-6.483a2.376 2.376 0 0 1 2.382-2.381zm26.987 0a2.376 2.376 0 0 1 2.381 2.38v6.483a2.376 2.376 0 0 1-2.38 2.381 2.376 2.376 0 0 1-2.382-2.38v-6.483a2.376 2.376 0 0 1 2.381-2.381z" paint-order="fill markers stroke"></path>
            <path fill="#fff" d="M13.378 9.448a1.029 1.029 0 0 1-1.029-1.03 1.029 1.029 0 0 1 1.03-1.028 1.029 1.029 0 0 1 1.028 1.029 1.029 1.029 0 0 1-1.029 1.029zm7.111 0a1.029 1.029 0 0 1-1.029-1.03 1.029 1.029 0 0 1 1.029-1.028 1.029 1.029 0 0 1 1.029 1.029 1.029 1.029 0 0 1-1.029 1.029z" paint-order="fill markers stroke"></path>
          </svg>

          <!--Other-->
          <svg v-if="game.platform=='Other'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" >
            <path d="M16 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2M18 9a1 1 0 1 0 0 2 1 1 0 1 0 0-2M16 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2M14 9a1 1 0 1 0 0 2 1 1 0 1 0 0-2M8 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4"></path><path d="M17 4H7C4.24 4 2 6.24 2 9v7.88a3.124 3.124 0 0 0 5.33 2.21l1.96-1.96c1.45-1.45 3.97-1.45 5.41 0l1.96 1.96c.59.59 1.37.91 2.21.91 1.72 0 3.12-1.4 3.12-3.12V9c0-2.76-2.24-5-5-5Zm3 12.88a1.118 1.118 0 0 1-1.91.79l-1.96-1.96c-1.1-1.1-2.56-1.71-4.12-1.71s-3.02.61-4.12 1.71l-1.96 1.96a1.118 1.118 0 0 1-1.91-.79V9c0-1.65 1.35-3 3-3h10c1.65 0 3 1.35 3 3v7.88Z"></path>
          </svg>

          
         <!-- {{ game.platform }} --> </span>
        <span v-if="game.genre" class="badge badge-outline ml-2 p-2 h-auto">

            <!--Boxicons v3.0 https://boxicons.com | License  https://docs.boxicons.com/free-->
            <!--Adventure-->
            <svg xmlns="http://www.w3.org/2000/svg" v-if="game.genre && game.genre.includes('Adventure') /* NEMOGU DIREKTNU USPOREDBU JER JE U DB ZAREZ! */" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" title="Adventure">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>

            <!-- RPG -->

            <svg v-if="game.genre && game.genre.includes('RPG')" xmlns="http://www.w3.org/2000/svg" width="24" height="24"  fill="currentColor" viewBox="0 0 24 24" title="RPG">
            <path d="m21,2h-5c-.3,0-.58.13-.77.37L6.93,12.51l-1.93-1.93v-2.59h-2v3c0,.27.11.52.29.71l3,3,.09.09-4.79,4.79,2.83,2.83,4.79-4.79.09.09,3,3c.19.19.44.29.71.29h3v-2h-2.59l-1.93-1.93,10.14-8.3c.23-.19.37-.47.37-.77V3c0-.55-.45-1-1-1Zm-1,5.53l-9.93,8.13-1.72-1.72,8.13-9.93h3.53v3.53Z"></path>
            </svg>
            
            <!--Racing -->

            <svg v-if="game.genre && game.genre.includes('Racing')" xmlns="http://www.w3.org/2000/svg" width="24" height="24"  fill="currentColor" viewBox="0 0 24 24" title="Racing">
            <path d="m21.55,3.69c-.28-.18-.64-.21-.95-.08-2.5,1.08-5.08.28-7.81-.56-2.96-.91-6.02-1.85-9.19-.48-.37.16-.6.52-.6.92v18.52h2v-6.81c2.31-.73,4.69,0,7.21.77,1.89.58,3.81 1.17 5.78 1.17 1.12 0 2.26-.19 3.41-.69.37-.16.6-.52.6-.92V4.52c0-.34-.17-.65-.45-.84Zm-12.74.37c-.16-.03-.31-.06-.47-.08.16.02.31.05.47.08Zm7.41,10.89c.15.02.29.05.44.07-.15-.02-.29-.04-.44-.07Zm3.79-6.08c-1,.27-2,.31-3,.2v3c1,.1,2,.06,3-.2v2.96c-.98.31-1.98.34-3,.23v-2.98c-1-.1-2-.34-3-.62v2.96c-.4-.12-.8-.24-1.21-.36-.59-.18-1.19-.36-1.79-.53v-2.97c-1-.28-2-.52-3-.62v3c.05,0,.1.02.15.02-.38-.04-.76-.08-1.14-.08-.67,0-1.34.07-2.01.23v-2.97c1-.27,2-.31,3-.2v-3c-1-.1-2-.06-3,.2v-2.96c.98-.31,1.98-.34,3-.23v2.98c1,.1,2,.34,3,.62v-2.96c.4.12.8.24 1.21.36.59.18 1.19.37 1.79.53v2.96c1,.28,2,.52,3,.62v-2.99c.99.09,1.99.06,3-.18v2.97Z"></path><path d="m11,7.55v3c1,.28,2,.62,3,.9v-3c-1-.28-2-.62-3-.9Z"></path>
            </svg>

            <!--Strategy-->

            <svg v-if="game.genre && game.genre.includes('Strategy')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" title="Strategy">
            <path d="M20 2A2 2 0 1 0 20 6 2 2 0 1 0 20 2z"></path><path d="m17,12l.5-5.5-5.5.5,1.75,1.75c-.47.4-1.01.5-1.69.63-1.05.19-2.35.44-3.4,1.93-1.05 1.49-.83 2.8-.65 3.85.15.9.26 1.55-.32 2.38-.58.82-1.23.94-2.12 1.11-1.05.19-2.35.43-3.4 1.93l1.64 1.15c.58-.82 1.22-.94 2.12-1.11 1.05-.19 2.35-.43 3.4-1.93 1.05-1.49.83-2.8.65-3.85-.15-.9-.26-1.55.32-2.38.58-.82 1.23-.94 2.12-1.11.84-.15 1.84-.35 2.74-1.18l1.83 1.83Z"></path><path d="M3.71 8.71 5.5 6.91 7.29 8.71 8.71 7.29 6.91 5.5 8.71 3.71 7.29 2.29 5.5 4.09 3.71 2.29 2.29 3.71 4.09 5.5 2.29 7.29 3.71 8.71z"></path><path d="M20.29 14.29 18 16.59 15.71 14.29 14.29 15.71 16.59 18 14.29 20.29 15.71 21.71 18 19.41 20.29 21.71 21.71 20.29 19.41 18 21.71 15.71 20.29 14.29z"></path>
            </svg>

            <!--Arcade-->
            <svg v-if="game.genre && game.genre.includes('Arcade')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" title="Arcade">
            <path d="M12 22c3.8 0 7.23-2.12 8.94-5.53.24-.48.06-1.05-.4-1.32L15.02 12l5.52-3.15c.46-.26.64-.84.4-1.32C19.23 4.12 15.81 2 12 2 6.49 2 2 6.49 2 12s4.49 10 10 10m0-18a7.95 7.95 0 0 1 6.68 3.61l-6.17 3.52c-.31.18-.5.51-.5.87s.19.69.5.87l6.17 3.52A7.94 7.94 0 0 1 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8"></path><path d="M11.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3"></path>
            </svg>

            <!--Casual-->

            <svg v-if="game.genre && game.genre.includes('Casual')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" title="Casual">
            <path d="m20.79,9.02c-.12.03-1.8.42-3.95,1.77-.32-1.57-1.28-4.5-4.11-7.49-.38-.4-1.07-.4-1.45,0-2.84,3-3.79,5.94-4.11,7.51-2.16-1.38-3.82-1.77-3.94-1.8-.3-.07-.61,0-.84.2-.24.19-.37.48-.37.78,0,7.29,3.93,12,10,12s10-4.82,10-12c0-.3-.14-.59-.37-.78-.24-.19-.54-.27-.84-.2Zm-11.79,3.02s.15-3.1,3-6.53c2.82,3.4,3,6.49,3,6.49v.12c-1,.83-2.03,1.86-3.01,3.15-.98-1.27-2.01-2.29-2.99-3.11v-.13Zm3,7.96c-5.32,0-7.55-4.2-7.94-8.56,1.66.72,4.62,2.43,7.11,6.12.19.28.51.42.84.44.33,0,.65-.17.83-.45,2.43-3.71,5.42-5.41,7.1-6.12-.4,4.23-2.63,8.57-7.93,8.57Z"></path>
            </svg>

            <!--Gacha-->
            <svg v-if="game.genre && game.genre.includes('Gacha')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 50 50" title="Gacha">
            <path d="M13.224 9L16 12c-.093.001-9.371.251-10.454 1.847-.179.264-.224.531-.135.794C5.685 15.458 7.01 16 7.01 16s-3.399-.616-4.677-1.819c-.51-.479-.245-1.165.173-1.648C3.786 11.056 8.606 9.504 13.224 9M13.224 7c-.072 0-.145.004-.217.012C8.417 7.512 2.817 9.12.994 11.224c-1.25 1.442-1.262 3.257-.031 4.415 1.627 1.53 5.026 2.209 5.69 2.329C6.773 17.99 6.893 18 7.011 18c.874 0 1.666-.575 1.919-1.44.192-.658.03-1.341-.381-1.837 1.895-.377 5.011-.67 7.487-.723.787-.017 1.494-.494 1.802-1.218.307-.725.165-1.562-.37-2.14l-2.776-3C14.311 7.23 13.778 7 13.224 7L13.224 7zM36.776 9c4.618.504 9.438 2.056 10.719 3.534.418.482.683 1.168.173 1.648C46.389 15.384 42.99 16 42.99 16s1.325-.542 1.599-1.359c.089-.263.043-.53-.135-.794C43.371 12.251 34.093 12.001 34 12L36.776 9M36.776 7c-.554 0-1.087.23-1.468.642l-2.776 3c-.538.582-.682 1.427-.367 2.154.315.727 1.031 1.2 1.823 1.204 2.462.053 5.577.346 7.47.724-.413.501-.574 1.189-.377 1.847C41.339 17.43 42.123 18 42.99 18c.118 0 .237-.01.357-.032.665-.12 4.063-.799 5.691-2.33 1.231-1.157 1.218-2.972-.032-4.414-1.823-2.104-7.424-3.712-12.013-4.212C36.921 7.004 36.848 7 36.776 7L36.776 7zM25 2c0 1.707 1.753 5.5 5.5 5.5-3.747 0-5.5 3.793-5.5 5.5 0-1.707-1.753-5.5-5.5-5.5C23.247 7.5 25 3.707 25 2M25 0c-1.105 0-2 .895-2 2 0 .594-.953 3.5-3.5 3.5-1.105 0-2 .895-2 2s.895 2 2 2c2.547 0 3.5 2.906 3.5 3.5 0 1.105.895 2 2 2s2-.895 2-2c0-.594.953-3.5 3.5-3.5 1.105 0 2-.895 2-2s-.895-2-2-2C27.953 5.5 27 2.594 27 2 27 .895 26.105 0 25 0L25 0zM24.541 19.089c1.843 0 4.202.423 6.156 1.105 1.365.492 2.583.515 3.991.541H35V29c-.047-.315-1.138-7.17-9.234-7.71-6.941 0-8.765 7.175-8.765 10.968 0 3.415 1.61 13.162 8.766 13.162.001 0 .001 0 .002 0 .876 0 2.339-.387 3.058-.905l.228-.164v-5.012c0-1.953-2.538-3.006-4.054-3.29h12.82C36.8 36.135 35 36.81 35 38.791v4.984c-2.021 2.583-4.987 3.839-9.233 3.839-9.103 0-14.757-5.863-14.757-15.301-.004-.195-.004-.391.001-.587.165-6.966 5.91-12.633 12.807-12.633.095 0 .191.001.287.003C24.27 19.091 24.404 19.089 24.541 19.089M24.541 17.089c-.141 0-.28.002-.444.007-.094-.002-.187-.003-.28-.003-7.974 0-14.616 6.543-14.807 14.585-.005.225-.005.449-.001.673 0 10.471 6.577 17.262 16.757 17.262 4.848 0 8.384-1.507 10.809-4.606C36.85 44.655 37 44.221 37 43.775v-4.984c0-.633.824-.735.989-.749 1.068-.091 1.874-1.007 1.829-2.078-.045-1.071-.927-1.915-1.998-1.915H25c-1.033 0-1.896.786-1.991 1.815-.096 1.028.607 1.96 1.623 2.151 1.337.251 2.423.981 2.423 1.325v3.822c-.421.141-.942.259-1.286.259-5.619 0-6.768-8.804-6.768-11.162 0-.365.077-8.912 6.7-8.968 6.317.456 7.236 5.434 7.321 6.002.146.987.994 1.707 1.977 1.707.049 0 .099-.002.149-.005C36.192 30.917 37 30.047 37 29v-8.266c0-1.105-.895-2-2-2h-.311c-1.297-.024-2.259-.042-3.313-.422C29.205 17.555 26.593 17.089 24.541 17.089L24.541 17.089z"></path>
            </svg>

            <!--Shooter -->
            <p v-if="game.genre && game.genre.includes('Shooter')" title="Shooter">🔫</p>

            <!--Fighting-->
            <svg v-if="game.genre && game.genre.includes('Fighting')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" title="Fighting">
            <path d="m22,5l-5-2v4.42c-1.34-.24-2.75-.36-4-.4v-1.82l3-1.2-5-2v5.02c-1.25.04-2.66.16-4,.4v-1.22l3-1.2-5-2v4.89c-1.73.54-3,1.37-3,2.61v8c0,2.76,6.29,3.5,10,3.5s10-.74,10-3.5v-8c0-1.24-1.27-2.07-3-2.61v-1.69l3-1.2Zm-12,14.93v-1.93h4v1.93c-.62.04-1.28.07-2,.07s-1.38-.03-2-.07Zm6-.21v-2.72c0-.55-.45-1-1-1h-6c-.55,0-1,.45-1,1v2.72c-2.4-.35-3.76-.96-4-1.29v-5.69c2.16.95,5.61,1.26,8,1.26s5.84-.31,8-1.26v5.69c-.24.33-1.6.94-4,1.29Zm-4-7.72c-4.75,0-7.4-.99-7.94-1.5.54-.51,3.19-1.5,7.94-1.5s7.4.99 7.94 1.5c-.54.51-3.19 1.5-7.94 1.5Z"></path>
            </svg>

            <!--Sport-->

            <svg v-if="game.genre && game.genre.includes('Sport')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" title="Sport">
            <path d="M14 2A2 2 0 1 0 14 6 2 2 0 1 0 14 2z"></path><path d="M6 18A2 2 0 1 0 6 22 2 2 0 1 0 6 18z"></path><path d="m7.83,8.11l-1.72,3.45,1.79.89,1.72-3.45h1.88l-1.82,4.38-2.03,1.62H3v2h4.65c.45,0,.9-.16,1.25-.44l2.15-1.72,1.71,2.99-3.46,3.46,1.41,1.41,3.46-3.46c.64-.64.77-1.62.32-2.41l-1.37-2.39,2.52-5.45h5.36v-2h-11.38c-.76,0-1.45.42-1.79 1.11Z"></path>
            </svg>

            <!--Simulation-->

            <svg v-if="game.genre && game.genre.includes('Simulation')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" title="Simulation">
            <path class="b" d="m20,14h-5v-1h4c1.1,0,2-.9,2-2v-7c0-1.1-.9-2-2-2H5c-1.1,0-2,.9-2,2v7c0,1.1.9,2,2,2h4v1h-5c-1.1,0-2,.9-2,2v4c0,1.1.9,2,2,2h16c1.1,0,2-.9,2-2v-4c0-1.1-.9-2-2-2Zm-15-3v-7h14v7s-14,0-14,0Zm-1,9v-4h16v4s-16,0-16,0Z"></path><path class="b" d="M6 17H14V19H6z"></path><path class="b" d="M17 17A1 1 0 1 0 17 19 1 1 0 1 0 17 17z"></path>
            </svg>

            <!--Action-->
            <img v-if="game.genre && game.genre.includes('Action')" width="24" height="24" 
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFTUlEQVR4nO2aCYhWZRSGH51MGxrTFsuMiBbNMLO0bIMyRAODysKgSFposw0piAwqaoJpsxIr2gzL9s2oyajMlqmcNjQt2yQnyzIzLJtGbZwbJ94Pztzu/f5lmPr/8IUL89/vfMu59yzvOXdgC8rCKGAx8CbQiypAT6A/MAg4GrgcWAB0AImu86lAvO0OGLtagGnARmAdMIwKV6QN+AX4CngRqAfGAzWSnya574HDqHLcJmU2AQ3AjlQxzgF+l0LrgYeAk4ABVCD6AL0j47sDd8ocE3etBT5ShHsVeBf4RnJN/+L5GaPN/9T1RgF/2A44FZgDLNWcvKBhCnU7zKFvcKHWnuBm/b0BOLLIdbYGdgL2AfYF9gAu1Dozu1mHvx32FefElynx1QL36n5zF9afqTVOppuzdos2+g44PDVuCv2ocVP4YOCgAv6TRrPm70UXsafs+GLgCnc1yGxsk7eAnXPmL3PmFuz9J+DcIvf/WXPsDZeNu4rM3q3AlaIpHsc4GVP6JeB950vnFXGGjZJPr100ztBmfwDPKVw26JoOzAYaFU3CYee5JHeayxdGGge7tSe5cLtVgXOskez25ShhyelXLXBmEfJjgdWSX6lwGpR7OMcsPtH4sAJrL5TcUeUococmv1zCnF2VN4ICZg6XRuQ/lNzQAuveIrlrKREDZc92kAPLyCf1Loe8kGMS47S+yY11xDIvMoaoWFI9U6+Jcykf4xWZbJ0vlOAMPYCpGdTka+CAyHpNkou94U6odeEulo331queGAm7g8SbEq1pOeRJd3gLFDcrENjvbyMhdiTQruARHkoUU7SoOVgeLMosSj1Rq0FmZSStWkW8xJlbqyJaQG/gPY2dXYSlLJf5R7GsCDowVTIrZLdeodV6egH9gHdSCg/PWPMijc+I7Gt55FnJRZnwSAn9EHG+3YDfJDdO5mV/v666IhGDfQa4x9GTRGZlimXhVslcFzug3liiiJeLqyR0X0TmQck8od9DnH33UHMh/ZY2FMjgE5S9EzGBPNQocCSak4tgy1bB5cGo+ufKGQErNW+w2/AxV58fEjGVa5zvBD42IyfMHisZ86covpRg3sZ5aNS8E929Vbp3aM6c/m5eBzAfeFqBIBEzSOMmjRlhjUaiTRLMs+M83K155rAhUiUKlVkYociTqOtynBsbLm6XZITZkEssjEfzQog6pWJ6xpNaq3v7p2RPdwf9WCVCGk9p/PjU/UBOo02KYH/lFPgPaK7loDRXW66kOSZFJC3nbJOz3ms5Dh1IbJSmXOI2KBULNPcEd6+vuiDpuqWtQDCZLJ8xX6lLjYVQnr7fCfdLyPq1paDOOeguGX43ydUTKyIktAa40RVcWcp+VgztD5zITKwUTHaFUxYGKEG25fhDkJnv3tpmdVPSmKtxT286oZ8IWUeJLUx74ksK5J4jXE2fhdEuD4Xr0QIJ24JLJiZK4FNKw/XOoa2zmAWf+dNOeoHL6OscvbF+VqwuMcqfieclYLV4sajVW2zPaAF59HA0fY7YsR30EfcGZushJmIOMSxSndMrS8t22WWpfSOLdKcUITfaNSH8ZfnkLBeWF+f4RvoBGiv4B5a6BkF3Yqj41yqxayOd+znWu0ZmWDaaFbFKpSVdRU/XCm2t1g8/fdWUCEpMoAoxSmVAKOBKZdr/OSznXO0Y9hJ9MqgqmP1/4GqP2yOEsSIxRFk68KeWAqVsRaFOuWWeU6BVTYVtqXAM1LeOxlQHcb0+S1jnpaIxQnW2bx60qzU0RR86Kxp91Ahod7X546LXO1BFWPh/+e+FJrFQ3xrdArqAvwCix+vY0vUdbgAAAABJRU5ErkJggg==" alt="action">

          <!--  <span v-else> {{ truncateText(game.genre, 12) }} </span> -->
         <!--  {{ truncateText(game.genre, 12) }} --></span>
      </div>
      
      <div class="flex items-center mb-2">
        <div class="flex">
          <template v-for="star in 5" :key="star">
            <svg class="w-3 h-3 sm:w-4 sm:h-4" 
                 :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'"
                 fill="currentColor" 
                 viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </template>
        </div>
        <span class="ml-1 sm:ml-2 text-xs sm:text-sm opacity-70">{{ game.rating || 0 }}/5</span>
      </div>
      
      <!-- Vrijeme igranja i Achievements -->
      <div class="mt-3 space-y-2">
        <div v-if="game.play_time" class="text-xs sm:text-sm opacity-70">
          {{ game.play_time }}h igranja
        </div>
        <div v-if="game.progress_value && game.progress_total" class="space-y-1">
          <!-- Progress Bar -->
          <div class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all"
              :style="{ width: `${achievementPercent}%` }"
            ></div>
          </div>
          <!-- Achievement Text -->
          <div class="flex justify-between items-center text-xs">
            <span class="font-semibold">{{ validatedProgressValue }}/{{ game.progress_total }} {{ achievementLabel }}</span>
            <span class="opacity-70">{{ achievementPercent }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  computed: {
    achievementLabel() {
      const source = this.game?.progress_source;
      const mode = this.game?.progress_mode;
      
      
      if (source === 'PlayStation 4' || source === 'PlayStation 5') return 'PSN Trophies';
      if (source === 'Xbox One' || source === 'Xbox Series X/S') return 'Xbox Achievements';
      if (source === 'Steam') return 'Steam Achievements';
      if (source === 'Nintendo Switch') return 'Achievements';
      
      
      if (mode === 'trophies_psn') return 'PSN Trophies';
      if (mode === 'trophies_xbox') return 'Xbox Achievements';
      if (mode === 'achievements_steam') return 'Steam Achievements';
      if (mode === 'achievements_gamecenter') return 'Game Center Achievements';
      
      return 'Achievements';
    },
    achievementPercent() {
      if (!this.game?.progress_value || !this.game?.progress_total) return 0;
      const value = Math.min(this.game.progress_value, this.game.progress_total);
      return Math.round((value / this.game.progress_total) * 100);
    },
    validatedProgressValue() {
      if (!this.game?.progress_value || !this.game?.progress_total) return 0;
      return Math.min(this.game.progress_value, this.game.progress_total);
    },
    gameStatus() {
      // BINTO: Support both new 'status' field and legacy 'currently_playing' !!!!!!
      if (this.game?.status) return this.game.status;
      if (this.game?.currently_playing) return 'playing';
      if (this.game?.end_date) return 'completed';
      return null;
    },
    statusBadgeText() {
      const statusMap = {
        'playing': 'Trenutno igram',
        'paused': 'Pauzirano',
        'completed': 'Završeno',
        'dropped': 'Napušteno',
        'backlog': 'Backlog'
      };
      return statusMap[this.gameStatus] || this.gameStatus;
    },
    statusBadgeClass() {
      const classMap = {
        'playing': 'badge-primary',
        'paused': 'badge-warning',
        'completed': 'badge-success',
        'dropped': 'badge-error',
        'backlog': 'badge-ghost'
      };
      return classMap[this.gameStatus] || 'badge-neutral';
    }
  },
  methods: {
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    getGameImage(game) {
      //FUNKCIJA SLIKE
      if (game.image_url) return game.image_url;
      if (game.background_image) return game.background_image;
      
      
      if (game.game_api_id) {
        
        const apiId = parseInt(game.game_api_id);
        if (!isNaN(apiId)) {
          return `https://api.rawg.io/media/games/${apiId}/media/screenshots/1.jpg`;
        }
      }
      
      
      return 'https://placehold.co/600x400?text=No+Image';
    },
    renderStars(rating) {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(i <= rating);
      }
      return stars;
    }
  }
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
