

<div class="container">

    <svg>
        <!-- User - Proposé -->
        <line x1="50" y1="23" x2="180" y2="23"/>

        <!-- Proposé - Validé -->
        <line x1="240" y1="46" x2="240" y2="133"/>

        <!-- Validé - Vendu -->
        <line x1="240" y1="179" x2="240" y2="266"/>

        <!-- Vendu - client-->
        <line x1="300" y1="291" x2="345" y2="291"/>

        <!-- Proposé - Refusé -->
        <path d="M 240 56 Q 240 90 207 90 L 180 90"/>

        <!-- Validé - Rendu -->
        <path d="M 240 189 Q 240 225 207 225 L 180 225"/>

    </svg>


    <i class="fas fa-user-alt"></i>

    <div class="state proposed">
        Proposé
    </div>

    <div class="state refused">
        Refusé
    </div>

    <div class="state valided">
        Validé
    </div>

    <div class="state giveback">
        Rendu
    </div>

    <i class="fas fa-child"></i>

    <div class="state sold">
        Vendu
    </div>

</div>

<style>

    .container {
        width: 400px;
        margin: auto;
        position: relative;
    }

    svg {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    line, path {
        fill: none;
        stroke:rgb(200, 200, 200);
        stroke-width: 2;
        stroke-dasharray: 6;
        animation: dash .5s linear infinite;
    }

    line.reverse {
        animation-direction: reverse;
    }

    @keyframes dash {
        to {stroke-dashoffset: -12;}
    }

    i {
        font-size: 3em;
        opacity: .6;
        position: absolute;
    }

    .fa-child {
        margin-top: 20px;
        margin-left: 40px;
        left: 300px;
    }

    .state {
        margin-top: 20px;
        margin-left: 60px;
        padding: 10px;
        text-align: center;
        text-transform: uppercase;
        font-weight: 400;
        font-size: 1em;
        width: 120px;
        border-radius: 6px;
        border: 2px solid;
    }

    .proposed, .valided, .sold {
        transform: translateX(120px);
    }

    .proposed {
        border-color:#f2f2f2;
    }

    .refused {
        border-color: #ffe6e6;
    }

    .valided {
        border-color: #e3fcff;
    }

    .giveback {
        border-color: #fff4e3;
    }

    .sold {
        border-color: #d9ffe0;
    }

</style>